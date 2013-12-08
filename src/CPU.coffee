###########################################################
# Bit constants
###########################################################

Bit0 = 1 << 0
Bit1 = 1 << 1
Bit2 = 1 << 2
Bit3 = 1 << 3
Bit4 = 1 << 4
Bit5 = 1 << 5
Bit6 = 1 << 6
Bit7 = 1 << 7

###########################################################
# Interrupt types
###########################################################

Interrupt =
    IRQ:   1
    NMI:   2
    Reset: 3

###########################################################
# Central processing unit
###########################################################

class CPU

    constructor: (@memory, @ppu, @papu) ->
        @init()
        @powerUp()
    
    ###########################################################
    # Power-up state
    ###########################################################

    powerUp: ->
        @resetRegistres()
        @resetFlags()
        @resetVariables()
        @resetMemory()
        @reset() # Causes reset interrupt on start.

    resetRegistres: ->
        @programCounter = 0  # 16-bit
        @stackPointer = 0xFD #  8-bit
        @accumulator = 0     #  8-bit
        @registerX = 0       #  8-bit
        @registerY = 0       #  8-bit

    resetFlags: ->
        @carryFlag = off       # bit 0
        @zeroFlag = off        # bit 1
        @interruptDisable = on # bit 2
        @decimalMode = off     # bit 3
        # Bit 4 (break command flag) is virtual (exists only as a copy on stack).
        # Bit 5 is pushed on stack as '1' during BRK/PHP instructions and IRQ/NMI interrupts.
        @overflowFlag = off    # bit 6
        @negativeFlag = off    # bit 7

    resetVariables: ->
        @cycle = 0
        @emptyReadCycle = no
        @emptyWriteCycle = no
        @requestedInterrupt = null

    resetMemory: ->
        @memory.write address, 0xFF for address in [0...0x0800]
        @memory.write 0x0008, 0xF7
        @memory.write 0x0009, 0xEF
        @memory.write 0x000A, 0xDF
        @memory.write 0x000F, 0xBF
        @memory.write 0x4017, 0x00
        @memory.write 0x4015, 0x00
        @memory.write address, 0x00 for address in [0x4000...0x4010]

    ###########################################################
    # Execution step
    ###########################################################

    step: ->
        @resolveInterrupt()

        operation        = @readOperation()
        instruction      = operation.instruction
        addressingMode   = operation.addressingMode
        @emptyReadCycle  = operation.emptyReadCycle
        @emptyWriteCycle = operation.emptyWriteCycle

        instruction addressingMode()

    ###########################################################
    # Program execution
    ###########################################################

    readOperation: ->
        operationCode = @readNextProgramByte()
        @operationsTable[operationCode]

    readNextProgramByte: ->
        @readByte @moveProgramCounter()

    readNextProgramWord: ->
        @readWord @moveProgramCounter 2

    moveProgramCounter: (size = 1) ->
        previousValue = @programCounter
        @programCounter = (@programCounter + size) & 0xFFFF
        previousValue

    ###########################################################
    # Interrupt handling
    ###########################################################

    resolveInterrupt: ->
        if @requestedInterrupt? and not @isRequestedInterruptDisabled()
            switch @requestedInterrupt
                when Interrupt.IRQ   then handleIRQ() 
                when Interrupt.NMI   then handleNMI()
                when Interrupt.Reset then handleReset()
            @tick()
            @tick() # To make totally 7 cycles together with interrupt handler.
            requestedInterrupt = null

    isRequestedInterruptDisabled: ->
        @requestedInterrupt == Interrupt.IRQ and @interruptDisable is on

    handleIRQ: ->
        @pushWord @programCounter
        @pushByte @getStatus() | Bit5
        @interruptDisable = on # Is set after pushing the CPU status on stack.
        @programCounter = @readWord 0xFFFE

    handleNMI: ->
        @pushWord @programCounter
        @pushByte @getStatus() | Bit5
        @interruptDisable = on # Is set after pushing the CPU status on stack. 
        @programCounter = @readWord 0xFFFA

    handleReset: ->
        @stackPointer -= 3 # Does not write on stack, just decrements its pointer.
        @interruptDisable = on
        @programCounter = @readWord 0xFFFC

    ###########################################################
    # Memory reading / writing
    ###########################################################

    readByte: (address) ->
        @resolveReadCycles()
        @memory.read address

    readWord: (address) ->
        highByte = @readByte (address + 1) & 0xFFFF
        highByte << 8 | @readByte address

    writeByte: (address, value) ->
        @resolveWriteCycles()
        @memory.write address, value

    writeWord: (address, value) ->
        @writeByte address, value & 0xFF
        @writeByte (address + 1) & 0xFFFF, value >> 8

    ###########################################################
    # Stack pushing / pulling
    ###########################################################

    pushByte: (value) ->
        @writeByte 0x100 + @stackPointer, value
        @stackPointer = (@stackPointer - 1) & 0xFF

    pushWord: (value) ->
        @pushByte (value >> 8) & 0xFF
        @pushByte value & 0xFF

    popByte: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @readByte 0x100 + @stackPointer

    popWord: ->
        result = @popByte()
        result |= @popByte() << 8

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
        @cycle++
        @ppu.tick() for [1..3]
        @papu.tick()
        undefined

    ###########################################################
    # CPU status word reading / writing
    ###########################################################

    getStatus: ->
        status = 0
        status |= Bit0 if @carryFlag
        status |= Bit1 if @zeroFlag
        status |= Bit2 if @interruptDisable
        status |= Bit3 if @decimalMode
        status |= Bit6 if @overflowFlag
        status |= Bit7 if @negativeFlag
        status

    setStatus: (status) ->
        @carryFlag        = @isBitSet status, 0
        @zeroFlag         = @isBitSet status, 1
        @interruptDisable = @isBitSet status, 2
        @decimalMode      = @isBitSet status, 3
        @overflowFlag     = @isBitSet status, 6
        @negativeFlag     = @isBitSet status, 7

    ###########################################################
    # CPU input signals
    ###########################################################

    reset: ->
        @setRequestedInterrupt Interrupt.Reset

    requestNonMaskableInterrupt: ->
        @setRequestedInterrupt Interrupt.NMI

    setRequestedInterrupt: (type) ->
        if @requestedInterrupt == null or type > @requestedInterrupt
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
        @readWord @readNextProgramWord()

    indirectXMode: =>
        @readWord @zeroPageXMode()

    indirectYMode: =>
        base = @readWord @readNextProgramByte()
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
        @carryFlag = off

    CLI: =>
        @interruptDisable = off

    CLD: =>
        @decimalMode = off

    CLV: =>
        @overflowFlag = off

    ###########################################################
    # Set flag instructions
    ###########################################################

    SEC: =>
        @carryFlag = on

    SEI: =>
        @interruptDisable = on

    SED: =>
        @decimalMode = on

    ###########################################################
    # Memory write instructions
    ###########################################################
    
    STA: (address) =>
        @writeByte address @accumulator

    STX: (address) =>
        @writeByte address @registerX

    STY: (address) =>
        @writeByte address @registerY

    ###########################################################
    # Memory read instructions
    ###########################################################

    LDA: (address) =>
        @accumulator = @readByte address
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    LDX: (address) =>
        @registerX = @readByte address
        @zeroFlag = @isZero @registerX
        @negativeFlag = @isNegative @registerX

    LDY: (address) =>
        @registerY = @readByte address
        @zeroFlag = @isZero @registerY
        @negativeFlag = @isNegative @registerY

    ###########################################################
    # Register transfer instructions
    ###########################################################

    TAX: =>
        @registerX = @accumulator
        @zeroFlag = @isZero @registerX
        @negativeFlag = @isNegative @registerX

    TAY: =>
        @registerY = @accumulator
        @zeroFlag = @isZero @registerY
        @negativeFlag = @isNegative @registerY

    TXA: =>
        @accumulator = @registerX
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    TYA: =>
        @accumulator = @registerY
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    TSX: =>
        @registerX = @stackPointer
        @zeroFlag = @isZero @registerX
        @negativeFlag = @isNegative @registerX

    TXS: =>
        @stackPointer = @registerX

    ###########################################################
    # Stack push instructions
    ###########################################################

    PHA: =>
        @pushByte @accumulator

    PHP: =>
        @pushByte @getStatus() | Bit4 | Bit5 # Pushes status with bit 4 (break command flag) and bit 5 on.

    ###########################################################
    # Stack pop instructions
    ###########################################################

    PLA: =>
        @accumulator = @popByte()
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    PLP: =>
        @setStatus @popByte()

    ###########################################################
    # Accumulator bitwise instructions
    ###########################################################

    AND: (address) =>
        @accumulator &= @readByte address
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    ORA: (address) =>
        @accumulator |= @readByte address
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    EOR: (address) =>
        @accumulator ^= @readByte address
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator

    BIT: (address) =>
        result = @accumulator & @readByte address
        @zeroFlag = @isZero result
        @overflowFlag = @isBitSet result, 6
        @negativeFlag = @isNegative result

    ###########################################################
    # Increment instructions
    ###########################################################

    INC: (address) =>
        result = (@readByte address) + 1
        @zeroFlag = @isZero result
        @negativeFlag = @isNegative result
        @writeByte address, result & 0xFF

    INX: =>
        @registerX = (@registerX + 1) & 0xFF
        @zeroFlag = @isZero @registerX
        @negativeFlag = @isNegative @registerX

    INY: =>
        @registerY = (@registerY + 1) & 0xFF
        @zeroFlag = @isZero @registerY
        @negativeFlag = @isNegative @registerY

    ###########################################################
    # Decrement instructions
    ###########################################################

    DEC: (address) =>
        result = (@readByte address) - 1
        @zeroFlag = @isZero result
        @negativeFlag = @isNegative result
        @writeByte address, result & 0xFF

    DEX: =>
        @registerX = (@registerX - 1) & 0xFF
        @zeroFlag = @isZero @registerX
        @negativeFlag = @isNegative @registerX

    DEY: =>
        @registerY = (@registerY - 1) & 0xFF
        @zeroFlag = @isZero @registerY
        @negativeFlag = @isNegative @registerY

    ###########################################################
    # Comparison instructions
    ###########################################################

    CMP: (address) =>
        @compareRegisterAndMemory @accumulator, address
        
    CPX: =>
        @compareRegisterAndMemory @registerX, address

    CPY: =>
        @compareRegisterAndMemory @registerY, address

    compareRegisterAndMemory: (register, address) -> 
        operand = @readByte address
        result = register - operand
        @carryFlag = not @isNegative result
        @zeroFlag = @isZero result
        @negativeFlag = @isNegative result

    ###########################################################
    # Branching instructions
    ###########################################################

    BCC: (address) =>
        @branchIf @carryFlag is off, address

    BCS: (address) =>
        @branchIf @carryFlag is on, address

    BNE: (address) =>
        @branchIf @zeroFlag is off, address

    BEQ: (address) =>
        @branchIf @zeroFlag is on, address

    BVC: (address) =>
        @branchIf @overflowFlag is off, address

    BVS: (address) =>
        @branchIf @overflowFlag is on,  address

    BPL: (address) =>
        @branchIf @negativeFlag is off, address

    BMI: (address) =>
        @branchIf @negativeFlag is on, address

    branchIf: (condition, address) ->
        if condition
            @programCounter = address
            @tick()

    ###########################################################
    # Jump / subroutine instructions
    ###########################################################

    JMP: (address) =>
        @programCounter = address

    JSR: (address) =>
        @pushWord @programCounter
        @programCounter = address

    RTS: =>
        @programCounter = @popWord()
        @tick()

    ###########################################################
    # Interrupt control instructions
    ###########################################################

    BRK: =>
        @pushWord @programCounter
        @pushByte @getStatus() | Bit4 | Bit5 # Pushes status with bit 4 (break command flag) and bit 5 on.
        @programCounter = @readWord 0xFFFE

    RTI: =>
        @setStatus @popByte()
        @programCounter = @popWord()

    ###########################################################
    # Addition / subtraction instructions
    ###########################################################

    ADC: (address) =>
        operand = @readByte address
        result = @accumulator + operand
        result++ if @carryFlag is on
        @carryFlag = @isOverflow result
        @zeroFlag = @isZero result
        @overflowFlag = @isSignedOverflow @accumulator, operand, result
        @negativeFlag = @isNegative result
        @accumulator = result & 0xFF

    SBC: (address) =>
        operand = @readByte address
        result = @accumulator - operand
        result-- if @carryFlag is off
        @carryFlag = not @isOverflow result
        @zeroFlag = @isZero result
        @overflowFlag = @isSignedOverflow @accumulator, operand, result
        @negativeFlag = @isNegative result
        @accumulator = result & 0xFF

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

    rotateAccumulatorOrMemory: (address, rotation, transferCarry) ->
        if address?
            operand = @readByte address
            result = rotation operand, transferCarry
            @writeByte address, result
        else
            @accumulator = rotation @accumulator, transferCarry

    rotateLeft: (value, transferCarry) =>
        value <<= 1
        value |= Bit1 if transferCarry and @carryFlag is on
        @carryFlag = @isOverflow value
        @zeroFlag = @isZero value
        @negativeFlag = @isNegative value
        value & 0xFF

    rotateRight: (value, transferCarry) =>
        oldCarryFlag = @carryFlag
        @carryFlag = @isBitSet value, 1
        value >>= 1
        value |= Bit7 if transferCarry and oldCarryFlag is on
        @zeroFlag = @isZero value
        @negativeFlag = @isNegative value
        value & 0xFF

    ###########################################################
    # Flags computation
    ###########################################################

    isBitSet: (value, bit) ->
        (value & (1 << bit)) != 0

    isZero: (value) ->
        (value & 0xFF) == 0

    isNegative: (value) ->
        @isBitSet value, 7

    isOverflow: (value) ->
        result > 0xFF

    isSignedOverflow: (operand1, operand2, result) ->
        not @isBitSet (operand1 ^ result) & (operand2 ^ result), 7

    ###########################################################
    # Operations table initialization
    ###########################################################

    init: ->
        @operationsTable = []

        ###########################################################
        # No operation instruction
        ###########################################################

        @registerOperation 0xEA, @NOP, @impliedMode, no, no # 2 cycles
        
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

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycle, emptyWriteCycle) ->
        @operationsTable[operationCode] = 
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycle: emptyReadCycle
            emptyWriteCycle: emptyWriteCycle

module.exports = CPU
