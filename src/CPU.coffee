Types  = require "./Types"
Format = require "./utils/Format"

byteAsHex = Format.byteAsHex
Interrupt = Types.Interrupt

###########################################################
# Central processing unit
###########################################################

class CPU

    @inject: [ "cpuMemory", "ppu", "apu", "dma" ]

    constructor: ->
        @initOperationsTable()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetRegisters()
        @resetVariables()
        @resetMemory()
        @reset() # Causes reset interrupt on start.

    resetRegisters: ->
        @programCounter = 0  # 16-bit
        @stackPointer = 0    #  8-bit
        @accumulator = 0     #  8-bit
        @registerX = 0       #  8-bit
        @registerY = 0       #  8-bit
        @setStatus 0         #  8-bit

    resetVariables: ->
        @cyclesCount = 0
        @emptyReadCycle = no
        @emptyWriteCycle = no
        @requestedInterrupt = null

    resetMemory: ->
        @write address, 0xFF for address in [0...0x0800]
        @write 0x0008, 0xF7
        @write 0x0009, 0xEF
        @write 0x000A, 0xDF
        @write 0x000F, 0xBF
        @write 0x4017, 0x00
        @write 0x4015, 0x00
        @write address, 0x00 for address in [0x4000...0x4010]

    ###########################################################
    # Execution step
    ###########################################################

    step: ->
        @resolveInterrupt()
        @executeInstruction()

    ###########################################################
    # Interrupt handling
    ###########################################################

    resolveInterrupt: ->
        if @requestedInterrupt? and not @isRequestedInterruptDisabled()
            switch @requestedInterrupt
                when Interrupt.IRQ   then @handleIRQ()
                when Interrupt.NMI   then @handleNMI()
                when Interrupt.RESET then @handleReset()
            @tick()
            @tick() # To make totally 7 cycles together with interrupt handler.
            @requestedInterrupt = null

    isRequestedInterruptDisabled: ->
        @interruptDisable and @requestedInterrupt is Interrupt.IRQ

    handleIRQ: ->
        @saveStateBeforeInterrupt()
        @enterInterruptHandler 0xFFFE

    handleNMI: ->
        @saveStateBeforeInterrupt()
        @enterInterruptHandler 0xFFFA

    handleReset: ->
        @stackPointer = (@stackPointer - 3) & 0xFF # Does not write on stack, just decrements its pointer.
        @tick() for [1..3]
        @enterInterruptHandler 0xFFFC

    saveStateBeforeInterrupt: ->
        @pushWord @programCounter
        @pushByte @getStatus()

    enterInterruptHandler: (address) ->
        @interruptDisable = 1
        @programCounter = @readWord address

    ###########################################################
    # Program execution
    ###########################################################

    executeInstruction: ->
        operation        = @readOperation()
        instruction      = operation.instruction
        addressingMode   = operation.addressingMode
        @emptyReadCycle  = operation.emptyReadCycle
        @emptyWriteCycle = operation.emptyWriteCycle

        instruction addressingMode()

    readOperation: ->
        operationCode = @readNextProgramByte()
        operation = @operationsTable[operationCode]
        throw "Unsupported operation (code: 0x#{byteAsHex operationCode})" unless operation?
        operation

    readNextProgramByte: ->
        @readByte @moveProgramCounter()

    readNextProgramWord: ->
        @readWord @moveProgramCounter 2

    moveProgramCounter: (size = 1) ->
        previousValue = @programCounter
        @programCounter = (@programCounter + size) & 0xFFFF
        previousValue

    ###########################################################
    # Memory reading / writing
    ###########################################################

    read: (address) ->
        @cpuMemory.read address

    readByte: (address) ->
        @resolveReadCycles()
        @read address

    readWord: (address) ->
        highByte = @readByte (address + 1) & 0xFFFF
        highByte << 8 | @readByte address

    readWordFromSamePage: (address) ->
        highByte = @readByte address & 0xFF00 | (address + 1) & 0x00FF
        highByte << 8 | @readByte address

    write: (address, value) ->
        @cpuMemory.write address, value

    writeByte: (address, value) ->
        @resolveWriteCycles()
        @write address, value

    writeWord: (address, value) ->
        @writeByte address, value & 0xFF
        @writeByte (address + 1) & 0xFFFF, value >>> 8

    ###########################################################
    # Stack pushing / pulling
    ###########################################################

    pushByte: (value) ->
        @writeByte 0x100 + @stackPointer, value
        @stackPointer = (@stackPointer - 1) & 0xFF

    pushWord: (value) ->
        @pushByte value >>> 8
        @pushByte value & 0xFF

    popByte: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @readByte 0x100 + @stackPointer

    popWord: ->
        @popByte() | @popByte() << 8

    ###########################################################
    # Memory reading / writing cycles handling
    ###########################################################

    resolveReadCycles: ->
        @tick()
        if @emptyReadCycle
            @emptyReadCycle = no
            @tick()

    resolveWriteCycles: ->
        @tick()
        if @emptyWriteCycle
            @emptyWriteCycle = no
            @tick()

    tick: ->
        @cyclesCount++
        @dma.tick()
        @ppu.tick() for [1..3]
        @apu.tick()
        undefined

    ###########################################################
    # CPU status reading / writing
    ###########################################################

    getStatus: ->
        @carryFlag             | # Bit 0
        @zeroFlag         << 1 | # Bit 1
        @interruptDisable << 2 | # Bit 2
        @decimalMode      << 3 | # Bit 3
        1                 << 5 | # Bit 5 (always set on when pushing status on stack)
        @overflowFlag     << 6 | # Bit 6
        @negativeFlag     << 7   # Bit 7

    setStatus: (value) ->
        @carryFlag        =  value        & 0x01 # Bit 0
        @zeroFlag         = (value >>> 1) & 0x01 # Bit 1
        @interruptDisable = (value >>> 2) & 0x01 # Bit 2
        @decimalMode      = (value >>> 3) & 0x01 # Bit 3
        @overflowFlag     = (value >>> 6) & 0x01 # Bit 6
        @negativeFlag     = (value >>> 7)        # Bit 7

    ###########################################################
    # CPU input signals
    ###########################################################

    reset: ->
        @setRequestedInterrupt Interrupt.RESET

    nonMaskableInterrupt: ->
        @setRequestedInterrupt Interrupt.NMI

    setRequestedInterrupt: (type) ->
        if @requestedInterrupt is null or type > @requestedInterrupt
            @requestedInterrupt = type

    ###########################################################
    # Basic addressing modes
    ###########################################################

    impliedMode: =>
        @tick()

    accumulatorMode: =>
        @tick()

    immediateMode: =>
        @moveProgramCounter()

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: =>
        @readNextProgramByte()

    zeroPageXMode: =>
        @getIndexedAddressByte @readNextProgramByte(), @registerX

    zeroPageYMode: =>
        @getIndexedAddressByte @readNextProgramByte(), @registerY

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: =>
        @readNextProgramWord()

    absoluteXMode: =>
        @getIndexedAddressWord @readNextProgramWord(), @registerX

    absoluteYMode: =>
        @getIndexedAddressWord @readNextProgramWord(), @registerY

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: =>
        base = (@programCounter + 1) & 0xFFFF # We need to get address of the next instruction
        offset = @getSignedByte @readNextProgramByte()
        @getIndexedAddressWord base, offset

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        @readWordFromSamePage @readNextProgramWord()

    indirectXMode: =>
        @readWordFromSamePage @zeroPageXMode()

    indirectYMode: =>
        base = @readWordFromSamePage @readNextProgramByte()
        @getIndexedAddressWord base, @registerY

    ###########################################################
    # Address computation
    ###########################################################

    getIndexedAddressByte: (base, offset) ->
        @emptyReadCycle = yes # Included here instead of in operations table just for simplification.
        (base + offset) & 0xFF

    getIndexedAddressWord : (base, offset) ->
        @emptyReadCycle = yes if @isPageCrossed base, offset
        (base + offset) & 0xFFFF

    isPageCrossed: (base, offset) ->
        (base & 0xFF00) != ((base + offset) & 0xFF00)

    getSignedByte: (value) ->
        if value >= 0x80 then value - 0x100 else value

    ###########################################################
    # No operation instruction
    ###########################################################

    NOP: =>

    ###########################################################
    # Clear flag instructions
    ###########################################################

    CLC: =>
        @carryFlag = 0

    CLI: =>
        @interruptDisable = 0

    CLD: =>
        @decimalMode = 0

    CLV: =>
        @overflowFlag = 0

    ###########################################################
    # Set flag instructions
    ###########################################################

    SEC: =>
        @carryFlag = 1

    SEI: =>
        @interruptDisable = 1

    SED: =>
        @decimalMode = 1

    ###########################################################
    # Memory write instructions
    ###########################################################

    STA: (address) =>
        @writeByte address, @accumulator

    STX: (address) =>
        @writeByte address, @registerX

    SAX: (address) =>
        @writeByte address, @accumulator & @registerX

    STY: (address) =>
        @writeByte address, @registerY

    ###########################################################
    # Memory read instructions
    ###########################################################

    LDA: (address) =>
        @storeValueIntoAccumulator @readByte address

    LDX: (address) =>
        @storeValueIntoRegisterX @readByte address

    LDY: (address) =>
        @storeValueIntoRegisterY @readByte address

    LAX: (address) =>
        value = @readByte address
        @storeValueIntoAccumulator value
        @storeValueIntoRegisterX value

    ###########################################################
    # Register transfer instructions
    ###########################################################

    TAX: =>
        @storeValueIntoRegisterX @accumulator

    TAY: =>
        @storeValueIntoRegisterY @accumulator

    TXA: =>
        @storeValueIntoAccumulator @registerX

    TYA: =>
        @storeValueIntoAccumulator @registerY

    TSX: =>
        @storeValueIntoRegisterX @stackPointer

    TXS: =>
        @stackPointer = @registerX

    ###########################################################
    # Stack push instructions
    ###########################################################

    PHA: =>
        @pushByte @accumulator

    PHP: =>
        @pushByte @getStatus() | 0x10 # Pushes status with bit 4 on (break command flag).

    ###########################################################
    # Stack pop instructions
    ###########################################################

    PLA: =>
        @storeValueIntoAccumulator @popByte()

    PLP: =>
        @setStatus @popByte()

    ###########################################################
    # Accumulator bitwise instructions
    ###########################################################

    AND: (address) =>
        @storeValueIntoAccumulator @accumulator & @readByte address

    ORA: (address) =>
        @storeValueIntoAccumulator @accumulator | @readByte address

    EOR: (address) =>
        @storeValueIntoAccumulator @accumulator ^ @readByte address

    BIT: (address) =>
        value = @readByte address
        @zeroFlag = (@accumulator & value) == 0
        @overflowFlag = (value >>> 6) & 0x01
        @negativeFlag = (value >>> 7) & 0x01

    ###########################################################
    # Increment instructions
    ###########################################################

    INC: (address) =>
        @storeValueIntoMemory address, ((@readByte address) + 1) & 0xFF

    INX: =>
        @storeValueIntoRegisterX (@registerX + 1) & 0xFF

    INY: =>
        @storeValueIntoRegisterY (@registerY + 1) & 0xFF

    ###########################################################
    # Decrement instructions
    ###########################################################

    DEC: (address) =>
        @storeValueIntoMemory address, ((@readByte address) - 1) & 0xFF

    DEX: =>
        @storeValueIntoRegisterX (@registerX - 1) & 0xFF

    DEY: =>
        @storeValueIntoRegisterY (@registerY - 1) & 0xFF

    ###########################################################
    # Comparison instructions
    ###########################################################

    CMP: (address) =>
        @compareRegisterAndMemory @accumulator, address

    CPX: (address) =>
        @compareRegisterAndMemory @registerX, address

    CPY: (address) =>
        @compareRegisterAndMemory @registerY, address

    ###########################################################
    # Branching instructions
    ###########################################################

    BCC: (address) =>
        @branchIf not @carryFlag, address

    BCS: (address) =>
        @branchIf @carryFlag, address

    BNE: (address) =>
        @branchIf not @zeroFlag, address

    BEQ: (address) =>
        @branchIf @zeroFlag, address

    BVC: (address) =>
        @branchIf not @overflowFlag, address

    BVS: (address) =>
        @branchIf @overflowFlag,  address

    BPL: (address) =>
        @branchIf not @negativeFlag, address

    BMI: (address) =>
        @branchIf @negativeFlag, address

    ###########################################################
    # Jump / subroutine instructions
    ###########################################################

    JMP: (address) =>
        @programCounter = address

    JSR: (address) =>
        @pushWord (@programCounter - 1) & 0xFFFF # The pushed address must be the end of the current instruction.
        @programCounter = address

    RTS: =>
        @programCounter = (@popWord() + 1) & 0xFFFF # We decremented the address when pushing it during JSR.
        @tick()

    ###########################################################
    # Interrupt control instructions
    ###########################################################

    BRK: =>
        @pushWord @programCounter
        @pushByte @getStatus() | 0x10 # Pushes status with bit 4 on (break command flag).
        @programCounter = @readWord 0xFFFE

    RTI: =>
        @setStatus @popByte()
        @programCounter = @popWord()

    ###########################################################
    # Addition / subtraction instructions
    ###########################################################

    ADC: (address) =>
        @addValueToAccumulator @readByte address

    SBC: (address) =>
        @addValueToAccumulator (@readByte address) ^ 0xFF # Together with internal carry incremment makes negative operand.

    ###########################################################
    # Shifting / rotation instructions
    ###########################################################

    ASL: (address) =>
        @rotateAccumulatorOrMemory address, @rotateLeft, false

    LSR: (address) =>
        @rotateAccumulatorOrMemory address, @rotateRight, false

    ROL: (address) =>
        @rotateAccumulatorOrMemory address, @rotateLeft, true

    ROR: (address) =>
        @rotateAccumulatorOrMemory address, @rotateRight, true

    ###########################################################
    # Hybrid instructions
    ###########################################################

    DCP: (address) =>
        @compareRegisterAndOperand @accumulator, @DEC address

    ISB: (address) =>
        @addValueToAccumulator (@INC address) ^ 0xFF # Together with internal carry incremment makes negative operand.

    SLO: (address) =>
        @storeValueIntoAccumulator @accumulator | @ASL address

    SRE: (address) =>
        @storeValueIntoAccumulator @accumulator ^ @LSR address

    RLA: (address) =>
        @storeValueIntoAccumulator @accumulator & @ROL address
        
    RRA: (address) =>
        @addValueToAccumulator @ROR address

    ###########################################################
    # Instruction helper functions
    ###########################################################

    storeValueIntoAccumulator: (value) ->
        @updateZeroAndNegativeFlag value
        @accumulator = value

    storeValueIntoRegisterX: (value) ->
        @updateZeroAndNegativeFlag value
        @registerX = value

    storeValueIntoRegisterY: (value) ->
        @updateZeroAndNegativeFlag value
        @registerY = value

    storeValueIntoMemory: (address, value) ->
        @updateZeroAndNegativeFlag value
        @writeByte address, value

    addValueToAccumulator: (operand) ->
        result = @accumulator + operand
        result++ if @carryFlag
        @carryFlag = (result >>> 8) & 0x01
        @overflowFlag = (((@accumulator ^ result) & (operand ^ result)) >>> 7) & 0x01 # Signed overflow
        @storeValueIntoAccumulator result & 0xFF

    compareRegisterAndMemory: (register, address) ->
        @compareRegisterAndOperand register, @readByte address

    compareRegisterAndOperand: (register, operand) ->
        result = register - operand
        @carryFlag = result >= 0 # Unsigned comparison (bit 8 is actually the result sign).
        @updateZeroAndNegativeFlag result # Not a signed comparison

    branchIf: (condition, address) ->
        if condition
            @programCounter = address
            @tick()

    rotateAccumulatorOrMemory: (address, rotation, transferCarry) ->
        if address?
            result = rotation (@readByte address), transferCarry
            @storeValueIntoMemory address, result
        else
            result = rotation @accumulator, transferCarry
            @storeValueIntoAccumulator result

    rotateLeft: (value, transferCarry) =>
        value <<= 1
        value |= 0x01 if transferCarry and @carryFlag
        @carryFlag = value >>> 8
        value & 0xFF

    rotateRight: (value, transferCarry) =>
        oldCarryFlag = @carryFlag
        @carryFlag = value & 0x01
        value >>>= 1
        value |= 0x80 if transferCarry and oldCarryFlag
        value & 0xFF

    updateZeroAndNegativeFlag: (value) ->
        @zeroFlag = (value & 0xFF) == 0
        @negativeFlag = (value >>> 7) & 0x01

    ###########################################################
    # Operations table initialization
    ###########################################################

    initOperationsTable: ->
        @operationsTable = []

        ###########################################################
        # No operation instruction
        ###########################################################

        @registerOperation 0x1A, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)
        @registerOperation 0x3A, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)
        @registerOperation 0x5A, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)
        @registerOperation 0x7A, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)
        @registerOperation 0xDA, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)
        @registerOperation 0xEA, @NOP, @impliedMode,   no, no # 2 cycles
        @registerOperation 0xFA, @NOP, @impliedMode,   no, no # 2 cycles (undocumented operation)

        @registerOperation 0x80, @NOP, @immediateMode, no, no # 2 cycles (undocumented operation)
        @registerOperation 0x82, @NOP, @immediateMode, no, no # 2 cycles (undocumented operation)
        @registerOperation 0x89, @NOP, @immediateMode, no, no # 2 cycles (undocumented operation)
        @registerOperation 0xC2, @NOP, @immediateMode, no, no # 2 cycles (undocumented operation)
        @registerOperation 0xE2, @NOP, @immediateMode, no, no # 2 cycles (undocumented operation)

        @registerOperation 0x04, @NOP, @zeroPageMode,  no, no # 3 cycles (undocumented operation)
        @registerOperation 0x44, @NOP, @zeroPageMode,  no, no # 3 cycles (undocumented operation)
        @registerOperation 0x64, @NOP, @zeroPageMode,  no, no # 3 cycles (undocumented operation)

        @registerOperation 0x14, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)
        @registerOperation 0x34, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)
        @registerOperation 0x54, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)
        @registerOperation 0x74, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)
        @registerOperation 0xD4, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)
        @registerOperation 0xF4, @NOP, @zeroPageXMode, no, no # 4 cycles (undocumented operation)

        @registerOperation 0x0C, @NOP, @absoluteMode,  no, no # 4 cycles (undocumented operation)
        
        @registerOperation 0x1C, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)
        @registerOperation 0x3C, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)
        @registerOperation 0x5C, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)
        @registerOperation 0x7C, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)
        @registerOperation 0xDC, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)
        @registerOperation 0xFC, @NOP, @absoluteXMode, no, no # 5 cycles (undocumented operation)

        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerOperation 0x18, @CLC, @impliedMode, no, no # 2 cycles
        @registerOperation 0x58, @CLI, @impliedMode, no, no # 2 cycles
        @registerOperation 0xD8, @CLD, @impliedMode, no, no # 2 cycles
        @registerOperation 0xB8, @CLV, @impliedMode, no, no # 2 cycles

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerOperation 0x38, @SEC, @impliedMode, no, no # 2 cycles
        @registerOperation 0x78, @SEI, @impliedMode, no, no # 2 cycles
        @registerOperation 0xF8, @SED, @impliedMode, no, no # 2 cycles

        ###########################################################
        # Memory write instructions
        ###########################################################

        @registerOperation 0x85, @STA, @zeroPageMode,  no,  no # 3 cycles
        @registerOperation 0x95, @STA, @zeroPageXMode, no,  no # 4 cycles
        @registerOperation 0x8D, @STA, @absoluteMode,  no,  no # 4 cycles
        @registerOperation 0x9D, @STA, @absoluteXMode, yes, no # 5 cycles
        @registerOperation 0x99, @STA, @absoluteYMode, yes, no # 5 cycles
        @registerOperation 0x81, @STA, @indirectXMode, no,  no # 6 cycles
        @registerOperation 0x91, @STA, @indirectYMode, yes, no # 6 cycles

        @registerOperation 0x86, @STX, @zeroPageMode,  no,  no # 3 cycles
        @registerOperation 0x96, @STX, @zeroPageYMode, no,  no # 4 cycles
        @registerOperation 0x8E, @STX, @absoluteMode,  no,  no # 4 cycles

        @registerOperation 0x87, @SAX, @zeroPageMode,  no,  no # 3 cycles (undocumented operation)
        @registerOperation 0x97, @SAX, @zeroPageYMode, no,  no # 4 cycles (undocumented operation)
        @registerOperation 0x8F, @SAX, @absoluteMode,  no,  no # 4 cycles (undocumented operation)
        @registerOperation 0x83, @SAX, @indirectXMode, no,  no # 6 cycles (undocumented operation)

        @registerOperation 0x84, @STY, @zeroPageMode,  no,  no # 3 cycles
        @registerOperation 0x94, @STY, @zeroPageXMode, no,  no # 4 cycles
        @registerOperation 0x8C, @STY, @absoluteMode,  no,  no # 4 cycles

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerOperation 0xA9, @LDA, @immediateMode, no, no # 2      cycles
        @registerOperation 0xA5, @LDA, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xB5, @LDA, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0xAD, @LDA, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0xBD, @LDA, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0xB9, @LDA, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0xA1, @LDA, @indirectXMode, no, no # 6      cycles
        @registerOperation 0xB1, @LDA, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0xA2, @LDX, @immediateMode, no, no # 2      cycles
        @registerOperation 0xA6, @LDX, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xB6, @LDX, @zeroPageYMode, no, no # 4      cycles
        @registerOperation 0xAE, @LDX, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0xBE, @LDX, @absoluteYMode, no, no # 4 (+1) cycles

        @registerOperation 0xA0, @LDY, @immediateMode, no, no # 2      cycles
        @registerOperation 0xA4, @LDY, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xB4, @LDY, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0xAC, @LDY, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0xBC, @LDY, @absoluteXMode, no, no # 4 (+1) cycles

        @registerOperation 0xA7, @LAX, @zeroPageMode,  no, no, # 3      cycles (undocumented operation)
        @registerOperation 0xB7, @LAX, @zeroPageYMode, no, no, # 4      cycles (undocumented operation)
        @registerOperation 0xAF, @LAX, @absoluteMode,  no, no, # 4      cycles (undocumented operation)
        @registerOperation 0xBF, @LAX, @absoluteYMode, no, no, # 4 (+1) cycles (undocumented operation)
        @registerOperation 0xA3, @LAX, @indirectXMode, no, no, # 6      cycles (undocumented operation)
        @registerOperation 0xB3, @LAX, @indirectYMode, no, no, # 5 (+1) cycles (undocumented operation)

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerOperation 0xAA, @TAX, @impliedMode, no, no # 2 cycles
        @registerOperation 0xA8, @TAY, @impliedMode, no, no # 2 cycles
        @registerOperation 0x8A, @TXA, @impliedMode, no, no # 2 cycles
        @registerOperation 0x98, @TYA, @impliedMode, no, no # 2 cycles
        @registerOperation 0x9A, @TXS, @impliedMode, no, no # 2 cycles
        @registerOperation 0xBA, @TSX, @impliedMode, no, no # 2 cycles

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerOperation 0x48, @PHA, @impliedMode, no, no # 3 cycles
        @registerOperation 0x08, @PHP, @impliedMode, no, no # 3 cycles

        ###########################################################
        # Stack pull instructions
        ###########################################################

        @registerOperation 0x68, @PLA, @impliedMode, yes, no # 4 cycles
        @registerOperation 0x28, @PLP, @impliedMode, yes, no # 4 cycles

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerOperation 0x29, @AND, @immediateMode, no, no # 2      cycles
        @registerOperation 0x25, @AND, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0x35, @AND, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0x2D, @AND, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0x3D, @AND, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0x39, @AND, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0x21, @AND, @indirectXMode, no, no # 6      cycles
        @registerOperation 0x31, @AND, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0x09, @ORA, @immediateMode, no, no # 2      cycles
        @registerOperation 0x05, @ORA, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0x15, @ORA, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0x0D, @ORA, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0x1D, @ORA, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0x19, @ORA, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0x01, @ORA, @indirectXMode, no, no # 6      cycles
        @registerOperation 0x11, @ORA, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0x49, @EOR, @immediateMode, no, no # 2      cycles
        @registerOperation 0x45, @EOR, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0x55, @EOR, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0x4D, @EOR, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0x5D, @EOR, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0x59, @EOR, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0x41, @EOR, @indirectXMode, no, no # 6      cycles
        @registerOperation 0x51, @EOR, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0x24, @BIT, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0x2C, @BIT, @absoluteMode,  no, no # 4      cycles

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerOperation 0xE6, @INC, @zeroPageMode,  no,  yes # 5 cycles
        @registerOperation 0xF6, @INC, @zeroPageXMode, no,  yes # 6 cycles
        @registerOperation 0xEE, @INC, @absoluteMode,  no,  yes # 6 cycles
        @registerOperation 0xFE, @INC, @absoluteXMode, yes, yes # 7 cycles

        @registerOperation 0xE8, @INX, @impliedMode,   no,  no  # 2 cycles
        @registerOperation 0xC8, @INY, @impliedMode,   no,  no  # 2 cycles

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerOperation 0xC6, @DEC, @zeroPageMode,  no,  yes # 5 cycles
        @registerOperation 0xD6, @DEC, @zeroPageXMode, no,  yes # 6 cycles
        @registerOperation 0xCE, @DEC, @absoluteMode,  no,  yes # 6 cycles
        @registerOperation 0xDE, @DEC, @absoluteXMode, yes, yes # 7 cycles

        @registerOperation 0xCA, @DEX, @impliedMode,   no,  no  # 2 cycles
        @registerOperation 0x88, @DEY, @impliedMode,   no,  no  # 2 cycles

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerOperation 0xC9, @CMP, @immediateMode, no, no # 2      cycles
        @registerOperation 0xC5, @CMP, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xD5, @CMP, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0xCD, @CMP, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0xDD, @CMP, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0xD9, @CMP, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0xC1, @CMP, @indirectXMode, no, no # 6      cycles
        @registerOperation 0xD1, @CMP, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0xE0, @CPX, @immediateMode, no, no # 2      cycles
        @registerOperation 0xE4, @CPX, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xEC, @CPX, @absoluteMode,  no, no # 4      cycles

        @registerOperation 0xC0, @CPY, @immediateMode, no, no # 2      cycles
        @registerOperation 0xC4, @CPY, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xCC, @CPY, @absoluteMode,  no, no # 4      cycles

        ###########################################################
        # Branching instructions
        ###########################################################

        @registerOperation 0x90, @BCC, @relativeMode, no, no # 2 (+1/+2) cycles
        @registerOperation 0xB0, @BCS, @relativeMode, no, no # 2 (+1/+2) cycles

        @registerOperation 0xD0, @BNE, @relativeMode, no, no # 2 (+1/+2) cycles
        @registerOperation 0xF0, @BEQ, @relativeMode, no, no # 2 (+1/+2) cycles

        @registerOperation 0x50, @BVC, @relativeMode, no, no # 2 (+1/+2) cycles
        @registerOperation 0x70, @BVS, @relativeMode, no, no # 2 (+1/+2) cycles

        @registerOperation 0x10, @BPL, @relativeMode, no, no # 2 (+1/+2) cycles
        @registerOperation 0x30, @BMI, @relativeMode, no, no # 2 (+1/+2) cycles

        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerOperation 0x4C, @JMP, @absoluteMode, no,  no # 3 cycles
        @registerOperation 0x6C, @JMP, @indirectMode, no,  no # 5 cycles
        @registerOperation 0x20, @JSR, @absoluteMode, yes, no # 6 cycles
        @registerOperation 0x60, @RTS, @impliedMode,  yes, no # 6 cycles

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerOperation 0x00, @BRK, @impliedMode, no,  no # 7 cycles
        @registerOperation 0x40, @RTI, @impliedMode, yes, no # 6 cycles

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################

        @registerOperation 0x69, @ADC, @immediateMode, no, no # 2      cycles
        @registerOperation 0x65, @ADC, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0x75, @ADC, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0x6D, @ADC, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0x7D, @ADC, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0x79, @ADC, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0x61, @ADC, @indirectXMode, no, no # 6      cycles
        @registerOperation 0x71, @ADC, @indirectYMode, no, no # 5 (+1) cycles

        @registerOperation 0xE9, @SBC, @immediateMode, no, no # 2      cycles
        @registerOperation 0xEB, @SBC, @immediateMode, no, no # 2      cycles (undocumented operation)
        @registerOperation 0xE5, @SBC, @zeroPageMode,  no, no # 3      cycles
        @registerOperation 0xF5, @SBC, @zeroPageXMode, no, no # 4      cycles
        @registerOperation 0xED, @SBC, @absoluteMode,  no, no # 4      cycles
        @registerOperation 0xFD, @SBC, @absoluteXMode, no, no # 4 (+1) cycles
        @registerOperation 0xF9, @SBC, @absoluteYMode, no, no # 4 (+1) cycles
        @registerOperation 0xE1, @SBC, @indirectXMode, no, no # 6      cycles
        @registerOperation 0xF1, @SBC, @indirectYMode, no, no # 5 (+1) cycles

        ###########################################################
        # Shifting instructions
        ###########################################################

        @registerOperation 0x0A, @ASL, @accumulatorMode, no,  no  # 2 cycles
        @registerOperation 0x06, @ASL, @zeroPageMode,    no,  yes # 5 cycles
        @registerOperation 0x16, @ASL, @zeroPageXMode,   no,  yes # 6 cycles
        @registerOperation 0x0E, @ASL, @absoluteMode,    no,  yes # 6 cycles
        @registerOperation 0x1E, @ASL, @absoluteXMode,   yes, yes # 7 cycles

        @registerOperation 0x4A, @LSR, @accumulatorMode, no,  no  # 2 cycles
        @registerOperation 0x46, @LSR, @zeroPageMode,    no,  yes # 5 cycles
        @registerOperation 0x56, @LSR, @zeroPageXMode,   no,  yes # 6 cycles
        @registerOperation 0x4E, @LSR, @absoluteMode,    no,  yes # 6 cycles
        @registerOperation 0x5E, @LSR, @absoluteXMode,   yes, yes # 7 cycles

        @registerOperation 0x2A, @ROL, @accumulatorMode, no,  no  # 2 cycles
        @registerOperation 0x26, @ROL, @zeroPageMode,    no,  yes # 5 cycles
        @registerOperation 0x36, @ROL, @zeroPageXMode,   no,  yes # 6 cycles
        @registerOperation 0x2E, @ROL, @absoluteMode,    no,  yes # 6 cycles
        @registerOperation 0x3E, @ROL, @absoluteXMode,   yes, yes # 7 cycles

        @registerOperation 0x6A, @ROR, @accumulatorMode, no,  no  # 2 cycles
        @registerOperation 0x66, @ROR, @zeroPageMode,    no,  yes # 5 cycles
        @registerOperation 0x76, @ROR, @zeroPageXMode,   no,  yes # 6 cycles
        @registerOperation 0x6E, @ROR, @absoluteMode,    no,  yes # 6 cycles
        @registerOperation 0x7E, @ROR, @absoluteXMode,   yes, yes # 7 cycles

        ###################################################################
        # Hybrid instructions
        ###################################################################

        @registerOperation 0xC7, @DCP, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0xD7, @DCP, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0xCF, @DCP, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0xDF, @DCP, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0xDB, @DCP, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0xC3, @DCP, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0xD3, @DCP, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

        @registerOperation 0xE7, @ISB, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0xF7, @ISB, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0xEF, @ISB, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0xFF, @ISB, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0xFB, @ISB, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0xE3, @ISB, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0xF3, @ISB, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

        @registerOperation 0x07, @SLO, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0x17, @SLO, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x0F, @SLO, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x1F, @SLO, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x1B, @SLO, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x03, @SLO, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0x13, @SLO, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

        @registerOperation 0x47, @SRE, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0x57, @SRE, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x4F, @SRE, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x5F, @SRE, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x5B, @SRE, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x43, @SRE, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0x53, @SRE, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

        @registerOperation 0x27, @RLA, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0x37, @RLA, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x2F, @RLA, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x3F, @RLA, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x3B, @RLA, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x23, @RLA, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0x33, @RLA, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

        @registerOperation 0x67, @RRA, @zeroPageMode,  no,  yes # 5 cycles (undocumented operation)
        @registerOperation 0x77, @RRA, @zeroPageXMode, no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x6F, @RRA, @absoluteMode,  no,  yes # 6 cycles (undocumented operation)
        @registerOperation 0x7F, @RRA, @absoluteXMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x7B, @RRA, @absoluteYMode, yes, yes # 7 cycles (undocumented operation)
        @registerOperation 0x63, @RRA, @indirectXMode, yes, yes # 8 cycles (undocumented operation)
        @registerOperation 0x73, @RRA, @indirectYMode, yes, yes # 8 cycles (undocumented operation)

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycle, emptyWriteCycle) ->
        @operationsTable[operationCode] =
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycle: emptyReadCycle
            emptyWriteCycle: emptyWriteCycle

module.exports = CPU
