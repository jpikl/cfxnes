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
        @emptyReadCycles = 0
        @emptyWriteCycles = 0
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
        if @dma.isTransferInProgress()
            @tick() # CPU can't access memory during DMA (empty cycle).
        else
            @resolveInterrupt()
            @executeInstruction()

    ###########################################################
    # Interrupt handling
    ###########################################################

    resolveInterrupt: ->
        if @requestedInterrupt and not @isRequestedInterruptDisabled()
            switch @requestedInterrupt
                when Interrupt.IRQ   then @handleIRQ()
                when Interrupt.NMI   then @handleNMI()
                when Interrupt.RESET then @handleReset()
            @tick()
            @tick() # To make totally 7 cycles.
            @requestedInterrupt = null

    isRequestedInterruptDisabled: ->
        @requestedInterrupt is Interrupt.IRQ and @interruptDisable

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
        operation         = @readOperation()
        instruction       = operation.instruction
        addressingMode    = operation.addressingMode
        @emptyReadCycles  = operation.emptyReadCycles
        @emptyWriteCycles = operation.emptyWriteCycles

        instruction addressingMode()

    readOperation: ->
        operationCode = @_readNextProgramByte()
        operation = @operationsTable[operationCode]
        throw "Unsupported operation (code: 0x#{byteAsHex operationCode})" unless operation?
        operation

    readNextProgramByte: ->
        @_readByte @_moveProgramCounter 1

    readNextProgramWord: ->
        @_readWord @_moveProgramCounter 2

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
        @_read address

    readWord: (address) ->
        highByte = @_readByte (address + 1) & 0xFFFF
        highByte << 8 | @_readByte address

    readWordFromSamePage: (address) ->
        highByte = @_readByte address & 0xFF00 | (address + 1) & 0x00FF
        highByte << 8 | @_readByte address

    write: (address, value) ->
        @cpuMemory.write address, value

    writeByte: (address, value) ->
        @resolveWriteCycles()
        @_write address, value

    writeWord: (address, value) ->
        @_writeByte address, value & 0xFF
        @_writeByte (address + 1) & 0xFFFF, value >>> 8

    ###########################################################
    # Stack pushing / pulling
    ###########################################################

    pushByte: (value) ->
        @_writeByte 0x100 + @stackPointer, value
        @stackPointer = (@stackPointer - 1) & 0xFF

    pushWord: (value) ->
        @_pushByte value >>> 8
        @_pushByte value & 0xFF

    popByte: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @_readByte 0x100 + @stackPointer

    popWord: ->
        @_popByte() | @_popByte() << 8

    ###########################################################
    # Memory reading / writing cycles handling
    ###########################################################

    resolveReadCycles: ->
        @_tick()
        if @emptyReadCycles
            @emptyReadCycles--
            @_tick()

    resolveWriteCycles: ->
        @_tick()
        if @emptyWriteCycles
            @emptyWriteCycles--
            @_tick()

    tick: ->
        @cyclesCount++
        @dma.tick()
        @ppu.tick()
        @ppu.tick()
        @ppu.tick()
        @apu.tick()
        undefined

    ###########################################################
    # CPU status reading / writing
    ###########################################################

    getStatus: ->
        @carryFlag             | # S[0]
        @zeroFlag         << 1 | # S[1]
        @interruptDisable << 2 | # S[2]
        @decimalMode      << 3 | # S[3]
        1                 << 5 | # S[5] (always set on when pushing status on stack)
        @overflowFlag     << 6 | # S[6]
        @negativeFlag     << 7   # S[7]

    setStatus: (value) ->
        @carryFlag        =  value        & 1 # S[0]
        @zeroFlag         = (value >>> 1) & 1 # S[1]
        @interruptDisable = (value >>> 2) & 1 # S[2]
        @decimalMode      = (value >>> 3) & 1 # S[3]
        @overflowFlag     = (value >>> 6) & 1 # S[6]
        @negativeFlag     = (value >>> 7)     # S[7]

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
        @_tick()

    accumulatorMode: =>
        @_tick()

    immediateMode: =>
        @_moveProgramCounter 1

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: =>
        @_readNextProgramByte()

    zeroPageXMode: =>
        @_getIndexedAddressByte @_readNextProgramByte(), @registerX

    zeroPageYMode: =>
        @_getIndexedAddressByte @_readNextProgramByte(), @registerY

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: =>
        @_readNextProgramWord()

    absoluteXMode: =>
        @_getIndexedAddressWord @_readNextProgramWord(), @registerX

    absoluteYMode: =>
        @_getIndexedAddressWord @_readNextProgramWord(), @registerY

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: =>
        base = (@programCounter + 1) & 0xFFFF # We need to get address of the next instruction
        offset = @_getSignedByte @_readNextProgramByte()
        @_getIndexedAddressWord base, offset

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        @_readWordFromSamePage @_readNextProgramWord()

    indirectXMode: =>
        @_readWordFromSamePage @zeroPageXMode()

    indirectYMode: =>
        base = @_readWordFromSamePage @_readNextProgramByte()
        @_getIndexedAddressWord base, @registerY

    ###########################################################
    # Address computation
    ###########################################################

    getIndexedAddressByte: (base, offset) ->
        (base + offset) & 0xFF

    getIndexedAddressWord : (base, offset) ->
        @emptyReadCycles = 1 if @_isPageCrossed base, offset
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
        @_writeByte address, @accumulator

    STX: (address) =>
        @_writeByte address, @registerX

    SAX: (address) =>
        @_writeByte address, @accumulator & @registerX

    STY: (address) =>
        @_writeByte address, @registerY

    ###########################################################
    # Memory read instructions
    ###########################################################

    LDA: (address) =>
        @_storeValueIntoAccumulator @_readByte address

    LDX: (address) =>
        @_storeValueIntoRegisterX @_readByte address

    LDY: (address) =>
        @_storeValueIntoRegisterY @_readByte address

    LAX: (address) =>
        value = @_readByte address
        @_storeValueIntoAccumulator value
        @_storeValueIntoRegisterX value

    ###########################################################
    # Register transfer instructions
    ###########################################################

    TAX: =>
        @_storeValueIntoRegisterX @accumulator

    TAY: =>
        @_storeValueIntoRegisterY @accumulator

    TXA: =>
        @_storeValueIntoAccumulator @registerX

    TYA: =>
        @_storeValueIntoAccumulator @registerY

    TSX: =>
        @_storeValueIntoRegisterX @stackPointer

    TXS: =>
        @stackPointer = @registerX

    ###########################################################
    # Stack push instructions
    ###########################################################

    PHA: =>
        @_pushByte @accumulator

    PHP: =>
        @_pushByte @_getStatus() | 0x10 # Pushes status with bit 4 on (break command flag).

    ###########################################################
    # Stack pop instructions
    ###########################################################

    PLA: =>
        @_storeValueIntoAccumulator @_popByte()

    PLP: =>
        @_setStatus @_popByte()

    ###########################################################
    # Accumulator bitwise instructions
    ###########################################################

    AND: (address) =>
        @_storeValueIntoAccumulator @accumulator & @_readByte address

    ORA: (address) =>
        @_storeValueIntoAccumulator @accumulator | @_readByte address

    EOR: (address) =>
        @_storeValueIntoAccumulator @accumulator ^ @_readByte address

    BIT: (address) =>
        value = @_readByte address
        @zeroFlag = (@accumulator & value) == 0
        @overflowFlag = (value >>> 6) & 1
        @negativeFlag = (value >>> 7) & 1

    ###########################################################
    # Increment instructions
    ###########################################################

    INC: (address) =>
        @_storeValueIntoMemory address, ((@_readByte address) + 1) & 0xFF

    INX: =>
        @_storeValueIntoRegisterX (@registerX + 1) & 0xFF

    INY: =>
        @_storeValueIntoRegisterY (@registerY + 1) & 0xFF

    ###########################################################
    # Decrement instructions
    ###########################################################

    DEC: (address) =>
        @_storeValueIntoMemory address, ((@_readByte address) - 1) & 0xFF

    DEX: =>
        @_storeValueIntoRegisterX (@registerX - 1) & 0xFF

    DEY: =>
        @_storeValueIntoRegisterY (@registerY - 1) & 0xFF

    ###########################################################
    # Comparison instructions
    ###########################################################

    CMP: (address) =>
        @_compareRegisterAndMemory @accumulator, address

    CPX: (address) =>
        @_compareRegisterAndMemory @registerX, address

    CPY: (address) =>
        @_compareRegisterAndMemory @registerY, address

    ###########################################################
    # Branching instructions
    ###########################################################

    BCC: (address) =>
        @_branchIf not @carryFlag, address

    BCS: (address) =>
        @_branchIf @carryFlag, address

    BNE: (address) =>
        @_branchIf not @zeroFlag, address

    BEQ: (address) =>
        @_branchIf @zeroFlag, address

    BVC: (address) =>
        @_branchIf not @overflowFlag, address

    BVS: (address) =>
        @_branchIf @overflowFlag,  address

    BPL: (address) =>
        @_branchIf not @negativeFlag, address

    BMI: (address) =>
        @_branchIf @negativeFlag, address

    ###########################################################
    # Jump / subroutine instructions
    ###########################################################

    JMP: (address) =>
        @programCounter = address

    JSR: (address) =>
        @_pushWord (@programCounter - 1) & 0xFFFF # The pushed address must be the end of the current instruction.
        @programCounter = address

    RTS: =>
        @programCounter = (@_popWord() + 1) & 0xFFFF # We decremented the address when pushing it during JSR.
        @_tick()

    ###########################################################
    # Interrupt control instructions
    ###########################################################

    BRK: =>
        @_pushWord @programCounter
        @_pushByte @_getStatus() | 0x10 # Pushes status with bit 4 on (break command flag).
        @programCounter = @_readWord 0xFFFE

    RTI: =>
        @_setStatus @_popByte()
        @programCounter = @_popWord()

    ###########################################################
    # Addition / subtraction instructions
    ###########################################################

    ADC: (address) =>
        @_addValueToAccumulator @_readByte address

    SBC: (address) =>
        @_addValueToAccumulator (@_readByte address) ^ 0xFF # Together with internal carry incremment makes negative operand.

    ###########################################################
    # Shifting / rotation instructions
    ###########################################################

    ASL: (address) =>
        @_rotateAccumulatorOrMemory address, @rotateLeft, false

    LSR: (address) =>
        @_rotateAccumulatorOrMemory address, @rotateRight, false

    ROL: (address) =>
        @_rotateAccumulatorOrMemory address, @rotateLeft, true

    ROR: (address) =>
        @_rotateAccumulatorOrMemory address, @rotateRight, true

    ###########################################################
    # Hybrid instructions
    ###########################################################

    DCP: (address) =>
        @_compareRegisterAndOperand @accumulator, @DEC address

    ISB: (address) =>
        @_addValueToAccumulator (@INC address) ^ 0xFF # Together with internal carry incremment makes negative operand.

    SLO: (address) =>
        @_storeValueIntoAccumulator @accumulator | @ASL address

    SRE: (address) =>
        @_storeValueIntoAccumulator @accumulator ^ @LSR address

    RLA: (address) =>
        @_storeValueIntoAccumulator @accumulator & @ROL address
        
    RRA: (address) =>
        @_addValueToAccumulator @ROR address

    ###########################################################
    # Instruction helper functions
    ###########################################################

    storeValueIntoAccumulator: (value) ->
        @_updateZeroAndNegativeFlag value
        @accumulator = value

    storeValueIntoRegisterX: (value) ->
        @_updateZeroAndNegativeFlag value
        @registerX = value

    storeValueIntoRegisterY: (value) ->
        @_updateZeroAndNegativeFlag value
        @registerY = value

    storeValueIntoMemory: (address, value) ->
        @_updateZeroAndNegativeFlag value
        @_writeByte address, value

    addValueToAccumulator: (operand) ->
        result = @accumulator + operand + @carryFlag
        @carryFlag = (result >>> 8) & 1
        @overflowFlag = (((@accumulator ^ result) & (operand ^ result)) >>> 7) & 1 # Signed overflow
        @_storeValueIntoAccumulator result & 0xFF

    compareRegisterAndMemory: (register, address) ->
        @_compareRegisterAndOperand register, @_readByte address

    compareRegisterAndOperand: (register, operand) ->
        result = register - operand
        @carryFlag = result >= 0 # Unsigned comparison (bit 8 is actually the result sign).
        @_updateZeroAndNegativeFlag result # Not a signed comparison

    branchIf: (condition, address) ->
        if condition
            @programCounter = address
            @_tick()

    rotateAccumulatorOrMemory: (address, rotation, transferCarry) ->
        if address?
            result = rotation (@_readByte address), transferCarry
            @_storeValueIntoMemory address, result
        else
            result = rotation @accumulator, transferCarry
            @_storeValueIntoAccumulator result

    rotateLeft: (value, transferCarry) =>
        value = value << 1 | transferCarry & @carryFlag
        @carryFlag = value >>> 8
        value & 0xFF

    rotateRight: (value, transferCarry) =>
        oldCarryFlag = @carryFlag
        @carryFlag = value & 1
        value >>> 1 | (transferCarry & oldCarryFlag) << 7

    updateZeroAndNegativeFlag: (value) ->
        @zeroFlag = (value & 0xFF) == 0
        @negativeFlag = (value >>> 7) & 1

    ###########################################################
    # Operations table initialization
    ###########################################################

    initOperationsTable: ->
        @operationsTable = []

        ###########################################################
        # 0 operation instruction
        ###########################################################

        @registerOperation 0x1A, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x3A, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x5A, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x7A, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xDA, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xEA, @NOP, @impliedMode,   0, 0 # 2 cycles
        @registerOperation 0xFA, @NOP, @impliedMode,   0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x80, @NOP, @immediateMode, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x82, @NOP, @immediateMode, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x89, @NOP, @immediateMode, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xC2, @NOP, @immediateMode, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xE2, @NOP, @immediateMode, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x04, @NOP, @zeroPageMode,  0, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x44, @NOP, @zeroPageMode,  0, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x64, @NOP, @zeroPageMode,  0, 0 # 3 cycles (undocumented operation)

        @registerOperation 0x14, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x34, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x54, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x74, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0xD4, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0xF4, @NOP, @zeroPageXMode, 1, 0 # 4 cycles (undocumented operation)

        @registerOperation 0x0C, @NOP, @absoluteMode,  0, 0 # 4 cycles (undocumented operation)
        
        @registerOperation 0x1C, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)
        @registerOperation 0x3C, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)
        @registerOperation 0x5C, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)
        @registerOperation 0x7C, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)
        @registerOperation 0xDC, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)
        @registerOperation 0xFC, @NOP, @absoluteXMode, 0, 0 # 5 cycles (undocumented operation)

        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerOperation 0x18, @CLC, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0x58, @CLI, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0xD8, @CLD, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0xB8, @CLV, @impliedMode, 0, 0 # 2 cycles

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerOperation 0x38, @SEC, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0x78, @SEI, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0xF8, @SED, @impliedMode, 0, 0 # 2 cycles

        ###########################################################
        # Memory write instructions
        ###########################################################

        @registerOperation 0x85, @STA, @zeroPageMode,  0, 0 # 3 cycles
        @registerOperation 0x95, @STA, @zeroPageXMode, 1, 0 # 4 cycles
        @registerOperation 0x8D, @STA, @absoluteMode,  0, 0 # 4 cycles
        @registerOperation 0x9D, @STA, @absoluteXMode, 1, 0 # 5 cycles
        @registerOperation 0x99, @STA, @absoluteYMode, 1, 0 # 5 cycles
        @registerOperation 0x81, @STA, @indirectXMode, 1, 0 # 6 cycles
        @registerOperation 0x91, @STA, @indirectYMode, 1, 0 # 6 cycles

        @registerOperation 0x86, @STX, @zeroPageMode,  0, 0 # 3 cycles
        @registerOperation 0x96, @STX, @zeroPageYMode, 1, 0 # 4 cycles
        @registerOperation 0x8E, @STX, @absoluteMode,  0, 0 # 4 cycles

        @registerOperation 0x87, @SAX, @zeroPageMode,  0, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x97, @SAX, @zeroPageYMode, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x8F, @SAX, @absoluteMode,  0, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x83, @SAX, @indirectXMode, 1, 0 # 6 cycles (undocumented operation)

        @registerOperation 0x84, @STY, @zeroPageMode,  0, 0 # 3 cycles
        @registerOperation 0x94, @STY, @zeroPageXMode, 1, 0 # 4 cycles
        @registerOperation 0x8C, @STY, @absoluteMode,  0, 0 # 4 cycles

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerOperation 0xA9, @LDA, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xA5, @LDA, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xB5, @LDA, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0xAD, @LDA, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0xBD, @LDA, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xB9, @LDA, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xA1, @LDA, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0xB1, @LDA, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0xA2, @LDX, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xA6, @LDX, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xB6, @LDX, @zeroPageYMode, 1, 0 # 4      cycles
        @registerOperation 0xAE, @LDX, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0xBE, @LDX, @absoluteYMode, 0, 0 # 4 (+1) cycles

        @registerOperation 0xA0, @LDY, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xA4, @LDY, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xB4, @LDY, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0xAC, @LDY, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0xBC, @LDY, @absoluteXMode, 0, 0 # 4 (+1) cycles

        @registerOperation 0xA7, @LAX, @zeroPageMode,  0, 0, # 3      cycles (undocumented operation)
        @registerOperation 0xB7, @LAX, @zeroPageYMode, 1, 0, # 4      cycles (undocumented operation)
        @registerOperation 0xAF, @LAX, @absoluteMode,  0, 0, # 4      cycles (undocumented operation)
        @registerOperation 0xBF, @LAX, @absoluteYMode, 0, 0, # 4 (+1) cycles (undocumented operation)
        @registerOperation 0xA3, @LAX, @indirectXMode, 1, 0, # 6      cycles (undocumented operation)
        @registerOperation 0xB3, @LAX, @indirectYMode, 0, 0, # 5 (+1) cycles (undocumented operation)

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerOperation 0xAA, @TAX, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0xA8, @TAY, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0x8A, @TXA, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0x98, @TYA, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0x9A, @TXS, @impliedMode, 0, 0 # 2 cycles
        @registerOperation 0xBA, @TSX, @impliedMode, 0, 0 # 2 cycles

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerOperation 0x48, @PHA, @impliedMode, 0, 0 # 3 cycles
        @registerOperation 0x08, @PHP, @impliedMode, 0, 0 # 3 cycles

        ###########################################################
        # Stack pull instructions
        ###########################################################

        @registerOperation 0x68, @PLA, @impliedMode, 1, 0 # 4 cycles
        @registerOperation 0x28, @PLP, @impliedMode, 1, 0 # 4 cycles

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerOperation 0x29, @AND, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0x25, @AND, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0x35, @AND, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0x2D, @AND, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0x3D, @AND, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x39, @AND, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x21, @AND, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0x31, @AND, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0x09, @ORA, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0x05, @ORA, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0x15, @ORA, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0x0D, @ORA, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0x1D, @ORA, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x19, @ORA, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x01, @ORA, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0x11, @ORA, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0x49, @EOR, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0x45, @EOR, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0x55, @EOR, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0x4D, @EOR, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0x5D, @EOR, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x59, @EOR, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x41, @EOR, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0x51, @EOR, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0x24, @BIT, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0x2C, @BIT, @absoluteMode,  0, 0 # 4      cycles

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerOperation 0xE6, @INC, @zeroPageMode,  0, 1 # 5 cycles
        @registerOperation 0xF6, @INC, @zeroPageXMode, 1, 1 # 6 cycles
        @registerOperation 0xEE, @INC, @absoluteMode,  0, 1 # 6 cycles
        @registerOperation 0xFE, @INC, @absoluteXMode, 1, 1 # 7 cycles

        @registerOperation 0xE8, @INX, @impliedMode,   0, 0 # 2 cycles
        @registerOperation 0xC8, @INY, @impliedMode,   0, 0 # 2 cycles

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerOperation 0xC6, @DEC, @zeroPageMode,  0, 1 # 5 cycles
        @registerOperation 0xD6, @DEC, @zeroPageXMode, 1, 1 # 6 cycles
        @registerOperation 0xCE, @DEC, @absoluteMode,  0, 1 # 6 cycles
        @registerOperation 0xDE, @DEC, @absoluteXMode, 1, 1 # 7 cycles

        @registerOperation 0xCA, @DEX, @impliedMode,   0, 0 # 2 cycles
        @registerOperation 0x88, @DEY, @impliedMode,   0, 0 # 2 cycles

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerOperation 0xC9, @CMP, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xC5, @CMP, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xD5, @CMP, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0xCD, @CMP, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0xDD, @CMP, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xD9, @CMP, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xC1, @CMP, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0xD1, @CMP, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0xE0, @CPX, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xE4, @CPX, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xEC, @CPX, @absoluteMode,  0, 0 # 4      cycles

        @registerOperation 0xC0, @CPY, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xC4, @CPY, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xCC, @CPY, @absoluteMode,  0, 0 # 4      cycles

        ###########################################################
        # Branching instructions
        ###########################################################

        @registerOperation 0x90, @BCC, @relativeMode, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0xB0, @BCS, @relativeMode, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0xD0, @BNE, @relativeMode, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0xF0, @BEQ, @relativeMode, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0x50, @BVC, @relativeMode, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0x70, @BVS, @relativeMode, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0x10, @BPL, @relativeMode, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0x30, @BMI, @relativeMode, 0, 0 # 2 (+1/+2) cycles

        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerOperation 0x4C, @JMP, @absoluteMode, 0, 0 # 3 cycles
        @registerOperation 0x6C, @JMP, @indirectMode, 0, 0 # 5 cycles
        @registerOperation 0x20, @JSR, @absoluteMode, 1, 0 # 6 cycles
        @registerOperation 0x60, @RTS, @impliedMode,  1, 0 # 6 cycles

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerOperation 0x00, @BRK, @impliedMode, 0, 0 # 7 cycles
        @registerOperation 0x40, @RTI, @impliedMode, 1, 0 # 6 cycles

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################

        @registerOperation 0x69, @ADC, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0x65, @ADC, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0x75, @ADC, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0x6D, @ADC, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0x7D, @ADC, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x79, @ADC, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0x61, @ADC, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0x71, @ADC, @indirectYMode, 0, 0 # 5 (+1) cycles

        @registerOperation 0xE9, @SBC, @immediateMode, 0, 0 # 2      cycles
        @registerOperation 0xEB, @SBC, @immediateMode, 0, 0 # 2      cycles (undocumented operation)
        @registerOperation 0xE5, @SBC, @zeroPageMode,  0, 0 # 3      cycles
        @registerOperation 0xF5, @SBC, @zeroPageXMode, 1, 0 # 4      cycles
        @registerOperation 0xED, @SBC, @absoluteMode,  0, 0 # 4      cycles
        @registerOperation 0xFD, @SBC, @absoluteXMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xF9, @SBC, @absoluteYMode, 0, 0 # 4 (+1) cycles
        @registerOperation 0xE1, @SBC, @indirectXMode, 1, 0 # 6      cycles
        @registerOperation 0xF1, @SBC, @indirectYMode, 0, 0 # 5 (+1) cycles

        ###########################################################
        # Shifting instructions
        ###########################################################

        @registerOperation 0x0A, @ASL, @accumulatorMode, 0, 0 # 2 cycles
        @registerOperation 0x06, @ASL, @zeroPageMode,    0, 1 # 5 cycles
        @registerOperation 0x16, @ASL, @zeroPageXMode,   1, 1 # 6 cycles
        @registerOperation 0x0E, @ASL, @absoluteMode,    0, 1 # 6 cycles
        @registerOperation 0x1E, @ASL, @absoluteXMode,   1, 1 # 7 cycles

        @registerOperation 0x4A, @LSR, @accumulatorMode, 0, 0 # 2 cycles
        @registerOperation 0x46, @LSR, @zeroPageMode,    0, 1 # 5 cycles
        @registerOperation 0x56, @LSR, @zeroPageXMode,   1, 1 # 6 cycles
        @registerOperation 0x4E, @LSR, @absoluteMode,    0, 1 # 6 cycles
        @registerOperation 0x5E, @LSR, @absoluteXMode,   1, 1 # 7 cycles

        @registerOperation 0x2A, @ROL, @accumulatorMode, 0, 0 # 2 cycles
        @registerOperation 0x26, @ROL, @zeroPageMode,    0, 1 # 5 cycles
        @registerOperation 0x36, @ROL, @zeroPageXMode,   1, 1 # 6 cycles
        @registerOperation 0x2E, @ROL, @absoluteMode,    0, 1 # 6 cycles
        @registerOperation 0x3E, @ROL, @absoluteXMode,   1, 1 # 7 cycles

        @registerOperation 0x6A, @ROR, @accumulatorMode, 0, 0 # 2 cycles
        @registerOperation 0x66, @ROR, @zeroPageMode,    0, 1 # 5 cycles
        @registerOperation 0x76, @ROR, @zeroPageXMode,   1, 1 # 6 cycles
        @registerOperation 0x6E, @ROR, @absoluteMode,    0, 1 # 6 cycles
        @registerOperation 0x7E, @ROR, @absoluteXMode,   1, 1 # 7 cycles

        ###################################################################
        # Hybrid instructions
        ###################################################################

        @registerOperation 0xC7, @DCP, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0xD7, @DCP, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xCF, @DCP, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xDF, @DCP, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xDB, @DCP, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xC3, @DCP, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0xD3, @DCP, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0xE7, @ISB, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0xF7, @ISB, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xEF, @ISB, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xFF, @ISB, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xFB, @ISB, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xE3, @ISB, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0xF3, @ISB, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x07, @SLO, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x17, @SLO, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x0F, @SLO, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x1F, @SLO, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x1B, @SLO, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x03, @SLO, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x13, @SLO, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x47, @SRE, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x57, @SRE, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x4F, @SRE, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x5F, @SRE, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x5B, @SRE, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x43, @SRE, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x53, @SRE, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x27, @RLA, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x37, @RLA, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x2F, @RLA, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x3F, @RLA, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x3B, @RLA, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x23, @RLA, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x33, @RLA, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x67, @RRA, @zeroPageMode,  0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x77, @RRA, @zeroPageXMode, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x6F, @RRA, @absoluteMode,  0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x7F, @RRA, @absoluteXMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x7B, @RRA, @absoluteYMode, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x63, @RRA, @indirectXMode, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x73, @RRA, @indirectYMode, 1, 1 # 8 cycles (undocumented operation)

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycles, emptyWriteCycles) ->
        @operationsTable[operationCode] =
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycles: emptyReadCycles
            emptyWriteCycles: emptyWriteCycles

module.exports = CPU
