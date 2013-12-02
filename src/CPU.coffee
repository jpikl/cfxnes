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

    constructor: (@memory, @ppu, @apu) ->
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

    resetRegistres: ->
        @programCounter = 0  # 16-bit
        @stackPointer = 0xFD # 8-bit
        @accumulator = 0     # 8-bit
        @registerX = 0       # 8-bit
        @registerY = 0       # 8-bit

    resetFlags: ->
        @carryFlag = off       # bit 0
        @zeroFlag = off        # bit 1
        @interruptDisable = on # bit 2
        @decimalMode = off     # bit 3
        @breakCommand = on     # bit 4
        @overflowFlag = off    # bit 6
        @negativeFlag = off    # bit 7

    resetVariables: ->
        @cycle = 0
        @emptyReadCycle = no
        @emptyWriteCycle = no
        @requestedInterrupt = null

    resetMemory: ->
        @writeByte address, 0xFF for address in [0...0x0800]
        @writeByte 0x0008, 0xF7
        @writeByte 0x0009, 0xEF
        @writeByte 0x000A, 0xDF
        @writeByte 0x000F, 0xBF
        @writeByte 0x4017, 0x00
        @writeByte 0x4015, 0x00
        @writeByte address, 0x00 for address in [0x4000...0x4010]

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
        prevValue = @programCounter
        @programCounter = (@programCounter + size) & 0xFFFF
        prevValue

    ###########################################################
    # Interrupt handling
    ###########################################################

    resolveInterrupt: ->
        if @requestedInterrupt? and not @interruptDisable
            switch @requestedInterrupt
                when Interrupt.IRQ   then @handleInterrupt 0xFFFE
                when Interrupt.NMI   then @handleInterrupt 0xFFFA
                when Interrupt.Reset then @handleInterrupt 0xFFFC
            requestedInterrupt = null
            @tick()
            @tick()

    handleInterrupt: (interruptVectorAddress)->
        @pushWord @programCounter
        @pushByte @getStatus()
        @interruptDisable = on
        @programCounter = @readWord interruptVectorAddress

    ###########################################################
    # Memory reading / writing
    ###########################################################

    readByte: (address) ->
        @resolveReadCycles()
        @memory.read address

    readWord: (address) ->
        (@readByte address + 1) << 8 | @readByte address

    writeByte: (address, value) ->
        @resolveWriteCycles()
        @memory.write address, value

    writeWord: (address, value) ->
        @writeByte address, value & 0xFF
        @writeByte address + 1, value >> 8

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
        tick()
        if @emptyReadCycle
            @emptyReadCycle = no
            @tick()

    resolveWriteCycles: ->
        tick()
        if @emptyWriteCycle
            @emptyWriteCycle = no
            @tick()

    tick: ->
        @cycle++
        @ppu.tick() for [1..3]
        @apu.tick()
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
        status |= Bit4 if @breakCommand
        status |= Bit6 if @overflowFlag
        status |= Bit7 if @negativeFlag
        status

    setStatus: (status) ->
        @carryFlag        = @isBitSet status, 0
        @zeroFlag         = @isBitSet status, 1
        @interruptDisable = @isBitSet status, 2
        @decimalMode      = @isBitSet status, 3
        @breakCommand     = @isBitSet status, 4
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
        offset = @getSignedByte @readNextProgramByte()
        @getIndexedAddressWord @programCounter, offset

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        @readWord @readNextProgramWord()

    indirectXMode: =>
        address = @getIndexedAddressByte @readNextProgramByte(), @registerX
        @readWord address

    indirectYMode: =>
        base = @readWord @readNextProgramByte()
        @getIndexedAddressWord base, @registerY

    ###########################################################
    # Address computation
    ###########################################################

    getIndexedAddressByte: (base, offset) ->
        @emptyReadCycle = yes
        (base + offset) & 0xFF

    getIndexedAddressWord : (base, offset) ->
        @emptyReadCycle = yes if base & 0xFF00 != (base + offset) & 0xFF00 # Page crossed
        (base + offset) & 0xFFFF

    getSignedByte: (value) ->
        if value < 0x80 then value else value - 0xFF

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
        @pushByte @getStatus()

    ###########################################################
    # Stack pop instructions
    ###########################################################

    PLA: =>
        @accumulator = @popByte()
        @zeroFlag = @isZero @accumulator
        @negativeFlag = @isNegative @accumulator
        @tick()

    PLP: =>
        @setStatus @popByte
        @tick()

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
        @overflowFlag = @isBitSet result, 7
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
        @carryFlag = result >= 0
        @computeZeroFlag result
        @computeNegativeFlag result

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

    BMI: (address) =>
        @branchIf @negativeFlag is on, address

    BPL: (address) =>
        @branchIf @negativeFlag is off, address

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
        tick()

    RTS: =>
        @programCounter = @popWord()
        tick()
        tick()

    ###########################################################
    # Interrupt control instructions
    ###########################################################

    BRK: =>
        @breakCommand = on
        @handleInterrupt 0xFFFE

    RTI: =>
        @setStatus @popByte()
        @programCounter = @popWord()
        tick()

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
    # Shifting instructions
    ###########################################################

    ASL: (address) =>
        if address?
            result = (@readByte address) << 1
            @carryFlag = @isOverflow result
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result & 0xFF
        else
            result = @accumulator << 1
            @carryFlag = @isOverflow result
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @accumulator = result & 0xFF

    LSR: (address) =>
        if address?
            result = @readByte address
            @carryFlag = @isBitSet result, 1
            result >>= 1
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result
        else
            @carryFlag = @isBitSet @accumulator, 1
            @accumulator >>= 1
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result

    ROL: (address) =>
        oldCarryFlag = @carryFlag
        if address?
            result = @readByte address
            @carryFlag = @isBitSet result, 7
            result = (result << 1) & 0xFF
            result |= Bit1 if oldCarryFlag is on
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result
        else
            @carryFlag = @isBitSet @accumulator, 7
            @accumulator = (@accumulator << 1) & 0xFF
            @accumulator |= Bit1 if oldCarryFlag is on
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result

    ROR: (address) =>
        oldCarryFlag = @carryFlag
        if address?
            result = @readByte address
            @carryFlag = @isBitSet result, 0
            result = result >> 1
            result |= Bit7 if oldCarryFlag is on
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result
        else
            @carryFlag = @isBitSet @accumulator, 0
            @accumulator = @accumulator >> 1
            @accumulator |= Bit7 if oldCarryFlag is on
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result

    ###########################################################
    # Flags computation
    ###########################################################

    isBitSet: (value, bit) ->
        value & (1 << bit) != 0

    isZero: (value) ->
        value & 0xFF != 0

    isNegative: (value) ->
        @isBitSet value, 7

    isOverflow: (value) ->
        result > 0xFF

    isSignedOverflow: (operand1, operand2, result) ->
        @isBitSet (operand1 ^ result) & (operand2 ^ result), 7

    ###########################################################
    # Operations table initialization
    ###########################################################

    init: ->
        @operationsTable = []

        ###########################################################
        # No operation instruction
        ###########################################################

        @registerOperation 0xEA, @NOP, @impliedMode, no, no
        
        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerOperation 0x18, @CLC, @impliedMode, no, no
        @registerOperation 0x58, @CLI, @impliedMode, no, no
        @registerOperation 0xD8, @CLD, @impliedMode, no, no
        @registerOperation 0xB8, @CLV, @impliedMode, no, no

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerOperation 0x38, @SEC, @impliedMode, no, no
        @registerOperation 0x78, @SEI, @impliedMode, no, no
        @registerOperation 0xF8, @SED, @impliedMode, no, no

        ###########################################################
        # Memory write instructions
        ###########################################################

        @registerOperation 0x85, @STA, @zeroPageMode,  no,  no
        @registerOperation 0x95, @STA, @zeroPageXMode, no,  no
        @registerOperation 0x8D, @STA, @absoluteMode,  no,  no
        @registerOperation 0x9D, @STA, @absoluteXMode, yes, no
        @registerOperation 0x99, @STA, @absoluteYMode, yes, no
        @registerOperation 0x81, @STA, @indirectXMode, no,  no
        @registerOperation 0x91, @STA, @indirectYMode, yes, no

        @registerOperation 0x86, @STX, @zeroPageMode,  no,  no
        @registerOperation 0x96, @STX, @zeroPageYMode, no,  no
        @registerOperation 0x8E, @STX, @absoluteMode,  no,  no

        @registerOperation 0x84, @STY, @zeroPageMode,  no,  no
        @registerOperation 0x94, @STY, @zeroPageXMode, no,  no
        @registerOperation 0x8C, @STY, @absoluteMode,  no,  no

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerOperation 0xA9, @LDA, @immediateMode, no, no
        @registerOperation 0xA5, @LDA, @zeroPageMode,  no, no
        @registerOperation 0xB5, @LDA, @zeroPageXMode, no, no
        @registerOperation 0xAD, @LDA, @absoluteMode,  no, no
        @registerOperation 0xBD, @LDA, @absoluteXMode, no, no
        @registerOperation 0xB9, @LDA, @absoluteYMode, no, no
        @registerOperation 0xA1, @LDA, @indirectXMode, no, no
        @registerOperation 0xB1, @LDA, @indirectYMode, no, no

        @registerOperation 0xA9, @LDX, @immediateMode, no, no
        @registerOperation 0xA5, @LDX, @zeroPageMode,  no, no
        @registerOperation 0xB5, @LDX, @zeroPageYMode, no, no
        @registerOperation 0xAD, @LDX, @absoluteMode,  no, no
        @registerOperation 0xBD, @LDX, @absoluteYMode, no, no

        @registerOperation 0xA9, @LDY, @immediateMode, no, no
        @registerOperation 0xA5, @LDY, @zeroPageMode,  no, no
        @registerOperation 0xB5, @LDY, @zeroPageXMode, no, no
        @registerOperation 0xAD, @LDY, @absoluteMode,  no, no
        @registerOperation 0xBD, @LDY, @absoluteXMode, no, no

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerOperation 0xAA, @TAX, @impliedMode, no, no
        @registerOperation 0xA8, @TAY, @impliedMode, no, no
        @registerOperation 0x8A, @TXA, @impliedMode, no, no
        @registerOperation 0x98, @TYA, @impliedMode, no, no
        @registerOperation 0x9A, @TXS, @impliedMode, no, no
        @registerOperation 0xBA, @TSX, @impliedMode, no, no

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerOperation 0x48, @PHA, @impliedMode, no, no
        @registerOperation 0x08, @PHP, @impliedMode, no, no

        ###########################################################
        # Stack pull instructions
        ###########################################################

        @registerOperation 0x68, @PLA, @impliedMode, no, no
        @registerOperation 0x28, @PLP, @impliedMode, no, no

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerOperation 0x29, @AND, @immediateMode, no, no
        @registerOperation 0x25, @AND, @zeroPageMode,  no, no
        @registerOperation 0x35, @AND, @zeroPageXMode, no, no
        @registerOperation 0x2D, @AND, @absoluteMode,  no, no
        @registerOperation 0x3D, @AND, @absoluteXMode, no, no
        @registerOperation 0x39, @AND, @absoluteYMode, no, no
        @registerOperation 0x21, @AND, @indirectXMode, no, no
        @registerOperation 0x31, @AND, @indirectYMode, no, no

        @registerOperation 0x49, @EOR, @immediateMode, no, no
        @registerOperation 0x45, @EOR, @zeroPageMode,  no, no
        @registerOperation 0x55, @EOR, @zeroPageXMode, no, no
        @registerOperation 0x4D, @EOR, @absoluteMode,  no, no
        @registerOperation 0x5D, @EOR, @absoluteXMode, no, no
        @registerOperation 0x59, @EOR, @absoluteYMode, no, no
        @registerOperation 0x41, @EOR, @indirectXMode, no, no
        @registerOperation 0x51, @EOR, @indirectYMode, no, no

        @registerOperation 0x09, @ORA, @immediateMode, no, no
        @registerOperation 0x05, @ORA, @zeroPageMode,  no, no
        @registerOperation 0x15, @ORA, @zeroPageXMode, no, no
        @registerOperation 0x0D, @ORA, @absoluteMode,  no, no
        @registerOperation 0x1D, @ORA, @absoluteXMode, no, no
        @registerOperation 0x19, @ORA, @absoluteYMode, no, no
        @registerOperation 0x01, @ORA, @indirectXMode, no, no
        @registerOperation 0x11, @ORA, @indirectYMode, no, no

        @registerOperation 0x24, @BIT, @zeroPageMode,  no, no
        @registerOperation 0x2C, @BIT, @absoluteMode,  no, no

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerOperation 0xC6, @INC, @zeroPageMode,  no,  yes
        @registerOperation 0xD6, @INC, @zeroPageXMode, no,  yes
        @registerOperation 0xCE, @INC, @absoluteMode,  no,  yes
        @registerOperation 0xDE, @INC, @absoluteXMode, yes, yes

        @registerOperation 0xCA, @INX, @impliedMode,   no,  no
        @registerOperation 0x88, @INY, @impliedMode,   no,  no

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerOperation 0xC6, @DEC, @zeroPageMode,  no,  yes
        @registerOperation 0xD6, @DEC, @zeroPageXMode, no,  yes
        @registerOperation 0xCE, @DEC, @absoluteMode,  no,  yes
        @registerOperation 0xDE, @DEC, @absoluteXMode, yes, yes

        @registerOperation 0xCA, @DEX, @impliedMode,   no,  no
        @registerOperation 0x88, @DEY, @impliedMode,   no,  no

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerOperation 0xC9, @CMP, @immediateMode, no, no
        @registerOperation 0xC5, @CMP, @zeroPageMode,  no, no
        @registerOperation 0xD5, @CMP, @zeroPageXMode, no, no
        @registerOperation 0xCD, @CMP, @absoluteMode,  no, no
        @registerOperation 0xDD, @CMP, @absoluteXMode, no, no
        @registerOperation 0xD9, @CMP, @absoluteYMode, no, no
        @registerOperation 0xC1, @CMP, @indirectXMode, no, no
        @registerOperation 0xD1, @CMP, @indirectYMode, no, no

        @registerOperation 0xE0, @CPX, @immediateMode, no, no
        @registerOperation 0xE4, @CPX, @zeroPageMode,  no, no
        @registerOperation 0xEC, @CPX, @absoluteMode,  no, no

        @registerOperation 0xC0, @CPY, @immediateMode, no, no
        @registerOperation 0xC4, @CPY, @zeroPageMode,  no, no
        @registerOperation 0xCC, @CPY, @absoluteMode,  no, no

        ###########################################################
        # Branching instructions
        ###########################################################

        @registerOperation 0x90, @BCC, @relativeMode, no, no
        @registerOperation 0xB0, @BCS, @relativeMode, no, no

        @registerOperation 0xD0, @BNE, @relativeMode, no, no
        @registerOperation 0xB0, @BEQ, @relativeMode, no, no
        
        @registerOperation 0x50, @BVC, @relativeMode, no, no
        @registerOperation 0x70, @BVS, @relativeMode, no, no

        @registerOperation 0x30, @BMI, @relativeMode, no, no
        @registerOperation 0x10, @BPL, @relativeMode, no, no
        
        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerOperation 0x4C, @JMP, @absoluteMode, no, no
        @registerOperation 0x6C, @JMP, @indirectMode, no, no
        @registerOperation 0x20, @JSR, @absoluteMode, no, no
        @registerOperation 0x60, @RTS, @impliedMode,  no, no

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerOperation 0x00, @BRK, @impliedMode, no, no
        @registerOperation 0x40, @RTI, @impliedMode, no, no

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################
        
        @registerOperation 0x69, @ADC, @immediateMode, no, no
        @registerOperation 0x65, @ADC, @zeroPageMode,  no, no
        @registerOperation 0x75, @ADC, @zeroPageXMode, no, no
        @registerOperation 0x6D, @ADC, @absoluteMode,  no, no
        @registerOperation 0x7D, @ADC, @absoluteXMode, no, no
        @registerOperation 0x79, @ADC, @absoluteYMode, no, no
        @registerOperation 0x61, @ADC, @indirectXMode, no, no
        @registerOperation 0x71, @ADC, @indirectYMode, no, no

        @registerOperation 0xE9, @SBC, @immediateMode, no, no
        @registerOperation 0xE5, @SBC, @zeroPageMode,  no, no
        @registerOperation 0xF5, @SBC, @zeroPageXMode, no, no
        @registerOperation 0xED, @SBC, @absoluteMode,  no, no
        @registerOperation 0xFD, @SBC, @absoluteXMode, no, no
        @registerOperation 0xF9, @SBC, @absoluteYMode, no, no
        @registerOperation 0xE1, @SBC, @indirectXMode, no, no
        @registerOperation 0xF1, @SBC, @indirectYMode, no, no

        ###########################################################
        # Shifting instructions
        ###########################################################
        
        @registerOperation 0x0A, @ASL, @accumulatorMode, no,  no
        @registerOperation 0x06, @ASL, @zeroPageMode,    no,  yes
        @registerOperation 0x16, @ASL, @zeroPageXMode,   no,  yes
        @registerOperation 0x0E, @ASL, @absoluteMode,    no,  yes
        @registerOperation 0x1E, @ASL, @absoluteXMode,   yes, yes

        @registerOperation 0xA9, @LSR, @accumulatorMode, no,  no
        @registerOperation 0xA5, @LSR, @zeroPageMode,    no,  yes
        @registerOperation 0xB5, @LSR, @zeroPageXMode,   no,  yes
        @registerOperation 0xAD, @LSR, @absoluteMode,    no,  yes
        @registerOperation 0xBD, @LSR, @absoluteXMode,   yes, yes

        @registerOperation 0x2A, @ROL, @accumulatorMode, no,  no
        @registerOperation 0x26, @ROL, @zeroPageMode,    no,  yes
        @registerOperation 0x36, @ROL, @zeroPageXMode,   no,  yes
        @registerOperation 0x2E, @ROL, @absoluteMode,    no,  yes
        @registerOperation 0x3E, @ROL, @absoluteXMode,   yes, yes

        @registerOperation 0x6A, @ROR, @accumulatorMode, no,  no
        @registerOperation 0x66, @ROR, @zeroPageMode,    no,  yes
        @registerOperation 0x76, @ROR, @zeroPageXMode,   no,  yes
        @registerOperation 0x6E, @ROR, @absoluteMode,    no,  yes
        @registerOperation 0x7E, @ROR, @absoluteXMode,   yes, yes

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycle, emptyWriteCycle) ->
        @operationsTable[operationCode] = 
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycle: emptyReadCycle
            emptyWriteCycle: emptyWriteCycle

module.exports = CPU
