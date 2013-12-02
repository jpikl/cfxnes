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
# Addressing modes IDs
###########################################################

AddressingMode =
    Implied:      1
    Accumulator:  2
    Immediate:    3
    ZeroPage:     4
    ZeroPageX:    5
    ZeroPageY:    6
    Absolute:     7
    AbsoluteX:    8
    AbsoluteY:    9
    Relative:    10
    Indirect:    11
    IndirectX:   12
    IndirectY:   13

###########################################################
# Instruction IDs
###########################################################

Instruction = 
    ADC:  1, AND:  2, ASL:  3, BCC:  4, BCS:  5, BEQ:  6, BIT:  7 
    BMI:  8, BNE:  9, BPL: 10, BRK: 11, BVC: 12, BVS: 13, CLC: 14
    CLD: 15, CLI: 16, CLV: 17, CMP: 18, CPX: 19, CPY: 20, DEC: 21 
    DEX: 22, DEY: 23, EOR: 24, INC: 25, INX: 26, INY: 27, JMP: 28
    JSR: 29, LDA: 30, LDX: 31, LDY: 32, LSR: 33, NOP: 34, ORA: 35 
    PHA: 36, PHP: 37, PLA: 38, PLP: 39, ROR: 40, ROL: 41, RTI: 42
    RTS: 43, SBC: 44, SEC: 45, SED: 46, SEI: 47, LDA: 48, LDX: 49 
    LDY: 50, TAX: 51, TAY: 52, TSX: 53, TXA: 54, TXS: 55, TYA: 56

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
        operation = @readOperation()
        @emptyReadCycle = operation.emptyReadCycle
        @emptyWriteCycle = operation.emptyWriteCycle
        addressingMode = operation.addressingMode
        instruction = operation.instruction
        address = @computeAddress addressingMode
        @executeInstruction instruction address

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

    computeAddress: (addressingMode) ->
        @addressingModesTable[addressingMode]()

    executeInstruction: (instruction, address) ->
        @instructionsTable[instruction](address)

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
    # Lookup tables initialization
    ###########################################################

    init: ->
        @initAddressingModesTable()
        @initInstructionsTable()
        @initOperationsTable()

    ###########################################################
    # Addressing modes
    ###########################################################

    initAddressingModesTable: ->
        @addressingModesTable = []

        ###########################################################
        # Basic modes
        ###########################################################

        @registerAddressingMode AddressingMode.Implied, ->
            @tick()

        @registerAddressingMode AddressingMode.Accumulator, ->
            @tick()

        @registerAddressingMode AddressingMode.Immediate, ->
            @moveProgramCounter()

        ###########################################################
        # Zero page modes
        ###########################################################

        @registerAddressingMode AddressingMode.ZeroPage, ->
            @readNextProgramByte()

        @registerAddressingMode AddressingMode.ZeroPageX, ->
            @getIndexedAddressByte @readNextProgramByte(), @registerX

        @registerAddressingMode AddressingMode.IndexedYZeroPage, ->
            @getIndexedAddressByte @readNextProgramByte(), @registerY

        ###########################################################
        # Absolute modes
        ###########################################################

        @registerAddressingMode AddressingMode.Absolute, ->
            @readNextProgramWord()

        @registerAddressingMode AddressingMode.AbsoluteX, ->
            @getIndexedAddressWord @readNextProgramWord(), @registerX

        @registerAddressingMode AddressingMode.AbsoluteY, ->
            @getIndexedAddressWord @readNextProgramWord(), @registerY

        ###########################################################
        # Relative mode
        ###########################################################

        @registerAddressingMode AddressingMode.Relative, ->
            offset = @getSignedByte @readNextProgramByte()
            @getIndexedAddressWord @programCounter, offset

        ###########################################################
        # Indirect modes
        ###########################################################

        @registerAddressingMode AddressingMode.Indirect, ->
            @readWord @readNextProgramWord()

        @registerAddressingMode AddressingMode.IndirectX, ->
            address = @getIndexedAddressByte @readNextProgramByte(), @registerX
            @readWord address

        @registerAddressingMode AddressingMode.IndirectY, ->
            base = @readWord @readNextProgramByte()
            @getIndexedAddressWord base, @registerY

    registerAddressingMode: (addressingMode, computation) ->
        @addressingModesTable[addressingMode] = computation

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
    # Instructions
    ###########################################################

    initInstructionsTable: ->
        @instructionsTable = []

        ###########################################################
        # No operation instruction
        ###########################################################

        @registerInstruction Instruction.NOP, ->

        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerInstruction Instruction.CLC, ->
            @carryFlag = off

        @registerInstruction Instruction.CLI, ->
            @interruptDisable = off

        @registerInstruction Instruction.CLD, ->
            @decimalMode = off

        @registerInstruction Instruction.CLV, ->
            @overflowFlag = off

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerInstruction Instruction.SEC, ->
            @carryFlag = on

        @registerInstruction Instruction.SEI, ->
            @interruptDisable = on

        @registerInstruction Instruction.SED, ->
            @decimalMode = on

        ###########################################################
        # Memory write instructions
        ###########################################################
        
        @registerInstruction Instruction.STA, (address) ->
            @writeByte address @accumulator

        @registerInstruction Instruction.STX, (address) ->
            @writeByte address @registerX

        @registerInstruction Instruction.STY, (address) ->
            @writeByte address @registerY

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerInstruction Instruction.LDA, (address) ->
            @accumulator = @readByte address
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.LDX, (address) ->
            @registerX = @readByte address
            @zeroFlag = @isZero @registerX
            @negativeFlag = @isNegative @registerX

        @registerInstruction Instruction.LDY, (address) ->
            @registerY = @readByte address
            @zeroFlag = @isZero @registerY
            @negativeFlag = @isNegative @registerY

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerInstruction Instruction.TAX, ->
            @registerX = @accumulator
            @zeroFlag = @isZero @registerX
            @negativeFlag = @isNegative @registerX

        @registerInstruction Instruction.TAY, ->
            @registerY = @accumulator
            @zeroFlag = @isZero @registerY
            @negativeFlag = @isNegative @registerY

        @registerInstruction Instruction.TXA, ->
            @accumulator = @registerX
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.TYA, ->
            @accumulator = @registerY
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.TSX, ->
            @registerX = @stackPointer
            @zeroFlag = @isZero @registerX
            @negativeFlag = @isNegative @registerX

        @registerInstruction Instruction.TXS, ->
            @stackPointer = @registerX

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerInstruction Instruction.PHA, ->
            @pushByte @accumulator

        @registerInstruction Instruction.PHP, ->
            @pushByte @getStatus()

        ###########################################################
        # Stack pop instructions
        ###########################################################

        @registerInstruction Instruction.PLA, ->
            @accumulator = @popByte()
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator
            @tick()

        @registerInstruction Instruction.PLP, ->
            @setStatus @popByte
            @tick()

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerInstruction Instruction.AND, (address) ->
            @accumulator &= @readByte address
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.ORA, (address) ->
            @accumulator |= @readByte address
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.EOR, (address) ->
            @accumulator ^= @readByte address
            @zeroFlag = @isZero @accumulator
            @negativeFlag = @isNegative @accumulator

        @registerInstruction Instruction.BIT, (address) ->
            result = @accumulator & @readByte address
            @zeroFlag = @isZero result
            @overflowFlag = @isBitSet result, 7
            @negativeFlag = @isNegative result

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerInstruction Instruction.INC, (address) ->
            result = (@readByte address) + 1
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result & 0xFF

        @registerInstruction Instruction.INX, ->
            @registerX = (@registerX + 1) & 0xFF
            @zeroFlag = @isZero @registerX
            @negativeFlag = @isNegative @registerX

        @registerInstruction Instruction.INY, ->
            @registerY = (@registerY + 1) & 0xFF
            @zeroFlag = @isZero @registerY
            @negativeFlag = @isNegative @registerY

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerInstruction Instruction.DEC, (address) ->
            result = (@readByte address) - 1
            @zeroFlag = @isZero result
            @negativeFlag = @isNegative result
            @writeByte address, result & 0xFF

        @registerInstruction Instruction.DEX, ->
            @registerX = (@registerX - 1) & 0xFF
            @zeroFlag = @isZero @registerX
            @negativeFlag = @isNegative @registerX

        @registerInstruction Instruction.DEY, ->
            @registerY = (@registerY - 1) & 0xFF
            @zeroFlag = @isZero @registerY
            @negativeFlag = @isNegative @registerY

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerInstruction Instruction.CMP, (address) ->
            @compareRegisterAndMemory @accumulator, address
            
        @registerInstruction Instruction.CPX, ->
            @compareRegisterAndMemory @registerX, address

        @registerInstruction Instruction.CPY, ->
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

        @registerInstruction Instruction.BCC, (address) ->
            @branchIf @carryFlag is off, address

        @registerInstruction Instruction.BCS, (address) ->
            @branchIf @carryFlag is on, address

        @registerInstruction Instruction.BNE, (address) ->
            @branchIf @zeroFlag is off, address

        @registerInstruction Instruction.BEQ, (address) ->
            @branchIf @zeroFlag is on, address

        @registerInstruction Instruction.BVC, (address) ->
            @branchIf @overflowFlag is off, address

        @registerInstruction Instruction.BVS, (address) ->
            @branchIf @overflowFlag is on,  address

        @registerInstruction Instruction.BMI, (address) ->
            @branchIf @negativeFlag is on, address

        @registerInstruction Instruction.BPL, (address) ->
            @branchIf @negativeFlag is off, address

        branchIf: (condition, address) ->
            if condition
                @programCounter = address
                @tick()

        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerInstruction Instruction.JMP, (address) ->
            @programCounter = address

        @registerInstruction Instruction.JSR, (address) ->
            @pushWord @programCounter
            @programCounter = address
            tick()

        @registerInstruction Instruction.RTS, ->
            @programCounter = @popWord()
            tick()
            tick()

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerInstruction Instruction.BRK, ->
            @breakCommand = on
            @handleInterrupt 0xFFFE

        @registerInstruction Instruction.RTI, ->
            @setStatus @popByte()
            @programCounter = @popWord()
            tick()

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################

        @registerInstruction Instruction.ADC, (address) ->
            operand = @readByte address
            result = @accumulator + operand
            result++ if @carryFlag is on
            @carryFlag = @isOverflow result
            @zeroFlag = @isZero result
            @overflowFlag = @isSignedOverflow @accumulator, operand, result
            @negativeFlag = @isNegative result
            @accumulator = result & 0xFF

        @registerInstruction Instruction.SBC, (address) ->
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

        @registerInstruction Instruction.ASL, (address) ->
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

        @registerInstruction Instruction.LSR, (address) ->
            if address?
                result = @readByte address
                @carryFlag = @isSetBit result, 1
                result >>= 1
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result
                @writeByte address, result
            else
                @carryFlag = @isSetBit @accumulator, 1
                @accumulator >>= 1
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result

        @registerInstruction Instruction.ROL, (address) ->
            oldCarryFlag = @carryFlag
            if address?
                result = @readByte address
                @carryFlag = @isSetBit result, 7
                result = (result << 1) & 0xFF
                result |= Bit1 if oldCarryFlag is on
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result
                @writeByte address, result
            else
                @carryFlag = @isSetBit @accumulator, 7
                @accumulator = (@accumulator << 1) & 0xFF
                @accumulator |= Bit1 if oldCarryFlag is on
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result

        @registerInstruction Instruction.ROR, (address) ->
            oldCarryFlag = @carryFlag
            if address?
                result = @readByte address
                @carryFlag = @isSetBit result, 0
                result = result >> 1
                result |= Bit7 if oldCarryFlag is on
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result
                @writeByte address, result
            else
                @carryFlag = @isSetBit @accumulator, 0
                @accumulator = @accumulator >> 1
                @accumulator |= Bit7 if oldCarryFlag is on
                @zeroFlag = @isZero result
                @negativeFlag = @isNegative result


    registerInstruction: (instruction, execution) ->
        @instructionsTable[instruction] = execution

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
    # Operations
    ###########################################################

    initOperationsTable: ->
        @operationsTable = []

        ###########################################################
        # No operation instruction
        ###########################################################

        @registerOperation 0xEA, Instruction.NOP, AddressingMode.Implied, no, no
        
        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerOperation 0x18, Instruction.CLC, AddressingMode.Implied, no, no
        @registerOperation 0x58, Instruction.CLI, AddressingMode.Implied, no, no
        @registerOperation 0xD8, Instruction.CLD, AddressingMode.Implied, no, no
        @registerOperation 0xB8, Instruction.CLV, AddressingMode.Implied, no, no

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerOperation 0x38, Instruction.SEC, AddressingMode.Implied, no, no
        @registerOperation 0x78, Instruction.SEI, AddressingMode.Implied, no, no
        @registerOperation 0xF8, Instruction.SED, AddressingMode.Implied, no, no

        ###########################################################
        # Memory write instructions
        ###########################################################

        @registerOperation 0x85, Instruction.STA, AddressingMode.ZeroPage,  no,  no
        @registerOperation 0x95, Instruction.STA, AddressingMode.ZeroPageX, no,  no
        @registerOperation 0x8D, Instruction.STA, AddressingMode.Absolute,  no,  no
        @registerOperation 0x9D, Instruction.STA, AddressingMode.AbsoluteX, yes, no
        @registerOperation 0x99, Instruction.STA, AddressingMode.AbsoluteY, yes, no
        @registerOperation 0x81, Instruction.STA, AddressingMode.IndirectX, no,  no
        @registerOperation 0x91, Instruction.STA, AddressingMode.IndirectY, yes, no

        @registerOperation 0x86, Instruction.STX, AddressingMode.ZeroPage,  no,  no
        @registerOperation 0x96, Instruction.STX, AddressingMode.ZeroPageY, no,  no
        @registerOperation 0x8E, Instruction.STX, AddressingMode.Absolute,  no,  no

        @registerOperation 0x84, Instruction.STY, AddressingMode.ZeroPage,  no,  no
        @registerOperation 0x94, Instruction.STY, AddressingMode.ZeroPageX, no,  no
        @registerOperation 0x8C, Instruction.STY, AddressingMode.Absolute,  no,  no

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerOperation 0xA9, Instruction.LDA, AddressingMode.Immediate, no, no
        @registerOperation 0xA5, Instruction.LDA, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xB5, Instruction.LDA, AddressingMode.ZeroPageX, no, no
        @registerOperation 0xAD, Instruction.LDA, AddressingMode.Absolute,  no, no
        @registerOperation 0xBD, Instruction.LDA, AddressingMode.AbsoluteX, no, no
        @registerOperation 0xB9, Instruction.LDA, AddressingMode.AbsoluteY, no, no
        @registerOperation 0xA1, Instruction.LDA, AddressingMode.IndirectX, no, no
        @registerOperation 0xB1, Instruction.LDA, AddressingMode.IndirectY, no, no

        @registerOperation 0xA9, Instruction.LDX, AddressingMode.Immediate, no, no
        @registerOperation 0xA5, Instruction.LDX, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xB5, Instruction.LDX, AddressingMode.ZeroPageY, no, no
        @registerOperation 0xAD, Instruction.LDX, AddressingMode.Absolute,  no, no
        @registerOperation 0xBD, Instruction.LDX, AddressingMode.AbsoluteY, no, no

        @registerOperation 0xA9, Instruction.LDY, AddressingMode.Immediate, no, no
        @registerOperation 0xA5, Instruction.LDY, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xB5, Instruction.LDY, AddressingMode.ZeroPageX, no, no
        @registerOperation 0xAD, Instruction.LDY, AddressingMode.Absolute,  no, no
        @registerOperation 0xBD, Instruction.LDY, AddressingMode.AbsoluteX, no, no

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerOperation 0xAA, Instruction.TAX, AddressingMode.Implied, no, no
        @registerOperation 0xA8, Instruction.TAY, AddressingMode.Implied, no, no
        @registerOperation 0x8A, Instruction.TXA, AddressingMode.Implied, no, no
        @registerOperation 0x98, Instruction.TYA, AddressingMode.Implied, no, no
        @registerOperation 0x9A, Instruction.TXS, AddressingMode.Implied, no, no
        @registerOperation 0xBA, Instruction.TSX, AddressingMode.Implied, no, no

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerOperation 0x48, Instruction.PHA, AddressingMode.Implied, no, no
        @registerOperation 0x08, Instruction.PHP, AddressingMode.Implied, no, no

        ###########################################################
        # Stack pull instructions
        ###########################################################

        @registerOperation 0x68, Instruction.PLA, AddressingMode.Implied, no, no
        @registerOperation 0x28, Instruction.PLP, AddressingMode.Implied, no, no

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerOperation 0x29, Instruction.AND, AddressingMode.Immediate, no, no
        @registerOperation 0x25, Instruction.AND, AddressingMode.ZeroPage,  no, no
        @registerOperation 0x35, Instruction.AND, AddressingMode.ZeroPageX, no, no
        @registerOperation 0x2D, Instruction.AND, AddressingMode.Absolute,  no, no
        @registerOperation 0x3D, Instruction.AND, AddressingMode.AbsoluteX, no, no
        @registerOperation 0x39, Instruction.AND, AddressingMode.AbsoluteY, no, no
        @registerOperation 0x21, Instruction.AND, AddressingMode.IndirectX, no, no
        @registerOperation 0x31, Instruction.AND, AddressingMode.IndirectY, no, no

        @registerOperation 0x49, Instruction.EOR, AddressingMode.Immediate, no, no
        @registerOperation 0x45, Instruction.EOR, AddressingMode.ZeroPage,  no, no
        @registerOperation 0x55, Instruction.EOR, AddressingMode.ZeroPageX, no, no
        @registerOperation 0x4D, Instruction.EOR, AddressingMode.Absolute,  no, no
        @registerOperation 0x5D, Instruction.EOR, AddressingMode.AbsoluteX, no, no
        @registerOperation 0x59, Instruction.EOR, AddressingMode.AbsoluteY, no, no
        @registerOperation 0x41, Instruction.EOR, AddressingMode.IndirectX, no, no
        @registerOperation 0x51, Instruction.EOR, AddressingMode.IndirectY, no, no

        @registerOperation 0x09, Instruction.ORA, AddressingMode.Immediate, no, no
        @registerOperation 0x05, Instruction.ORA, AddressingMode.ZeroPage,  no, no
        @registerOperation 0x15, Instruction.ORA, AddressingMode.ZeroPageX, no, no
        @registerOperation 0x0D, Instruction.ORA, AddressingMode.Absolute,  no, no
        @registerOperation 0x1D, Instruction.ORA, AddressingMode.AbsoluteX, no, no
        @registerOperation 0x19, Instruction.ORA, AddressingMode.AbsoluteY, no, no
        @registerOperation 0x01, Instruction.ORA, AddressingMode.IndirectX, no, no
        @registerOperation 0x11, Instruction.ORA, AddressingMode.IndirectY, no, no

        @registerOperation 0x24, Instruction.BIT, AddressingMode.ZeroPage,  no, no
        @registerOperation 0x2C, Instruction.BIT, AddressingMode.Absolute,  no, no

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerOperation 0xC6, Instruction.INC, AddressingMode.ZeroPage,  no,  yes
        @registerOperation 0xD6, Instruction.INC, AddressingMode.ZeroPageX, no,  yes
        @registerOperation 0xCE, Instruction.INC, AddressingMode.Absolute,  no,  yes
        @registerOperation 0xDE, Instruction.INC, AddressingMode.AbsoluteX, yes, yes

        @registerOperation 0xCA, Instruction.INX, AddressingMode.Implied,   no,  no
        @registerOperation 0x88, Instruction.INY, AddressingMode.Implied,   no,  no

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerOperation 0xC6, Instruction.DEC, AddressingMode.ZeroPage,  no,  yes
        @registerOperation 0xD6, Instruction.DEC, AddressingMode.ZeroPageX, no,  yes
        @registerOperation 0xCE, Instruction.DEC, AddressingMode.Absolute,  no,  yes
        @registerOperation 0xDE, Instruction.DEC, AddressingMode.AbsoluteX, yes, yes

        @registerOperation 0xCA, Instruction.DEX, AddressingMode.Implied,   no,  no
        @registerOperation 0x88, Instruction.DEY, AddressingMode.Implied,   no,  no

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerOperation 0xC9, Instruction.CMP, AddressingMode.Immediate, no, no
        @registerOperation 0xC5, Instruction.CMP, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xD5, Instruction.CMP, AddressingMode.ZeroPageX, no, no
        @registerOperation 0xCD, Instruction.CMP, AddressingMode.Absolute,  no, no
        @registerOperation 0xDD, Instruction.CMP, AddressingMode.AbsoluteX, no, no
        @registerOperation 0xD9, Instruction.CMP, AddressingMode.AbsoluteY, no, no
        @registerOperation 0xC1, Instruction.CMP, AddressingMode.IndirectX, no, no
        @registerOperation 0xD1, Instruction.CMP, AddressingMode.IndirectY, no, no

        @registerOperation 0xE0, Instruction.CPX, AddressingMode.Immediate, no, no
        @registerOperation 0xE4, Instruction.CPX, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xEC, Instruction.CPX, AddressingMode.Absolute,  no, no

        @registerOperation 0xC0, Instruction.CPY, AddressingMode.Immediate, no, no
        @registerOperation 0xC4, Instruction.CPY, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xCC, Instruction.CPY, AddressingMode.Absolute,  no, no

        ###########################################################
        # Branching instructions
        ###########################################################

        @registerOperation 0x90, Instruction.BCC, AddressingMode.Relative, no, no
        @registerOperation 0xB0, Instruction.BCS, AddressingMode.Relative, no, no

        @registerOperation 0xD0, Instruction.BNE, AddressingMode.Relative, no, no
        @registerOperation 0xB0, Instruction.BEQ, AddressingMode.Relative, no, no
        
        @registerOperation 0x50, Instruction.BVC, AddressingMode.Relative, no, no
        @registerOperation 0x70, Instruction.BVS, AddressingMode.Relative, no, no

        @registerOperation 0x30, Instruction.BMI, AddressingMode.Relative, no, no
        @registerOperation 0x10, Instruction.BPL, AddressingMode.Relative, no, no
        
        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerOperation 0x4C, Instruction.JMP, AddressingMode.Absolute, no, no
        @registerOperation 0x6C, Instruction.JMP, AddressingMode.Indirect, no, no
        @registerOperation 0x20, Instruction.JSR, AddressingMode.Absolute, no, no
        @registerOperation 0x60, Instruction.RTS, AddressingMode.Implied,  no, no

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerOperation 0x00, Instruction.BRK, AddressingMode.Implied, no, no
        @registerOperation 0x40, Instruction.RTI, AddressingMode.Implied, no, no

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################
        
        @registerOperation 0x69, Instruction.ADC, AddressingMode.Immediate, no, no
        @registerOperation 0x65, Instruction.ADC, AddressingMode.ZeroPage,  no, no
        @registerOperation 0x75, Instruction.ADC, AddressingMode.ZeroPageX, no, no
        @registerOperation 0x6D, Instruction.ADC, AddressingMode.Absolute,  no, no
        @registerOperation 0x7D, Instruction.ADC, AddressingMode.AbsoluteX, no, no
        @registerOperation 0x79, Instruction.ADC, AddressingMode.AbsoluteY, no, no
        @registerOperation 0x61, Instruction.ADC, AddressingMode.IndirectX, no, no
        @registerOperation 0x71, Instruction.ADC, AddressingMode.IndirectY, no, no

        @registerOperation 0xE9, Instruction.SBC, AddressingMode.Immediate, no, no
        @registerOperation 0xE5, Instruction.SBC, AddressingMode.ZeroPage,  no, no
        @registerOperation 0xF5, Instruction.SBC, AddressingMode.ZeroPageX, no, no
        @registerOperation 0xED, Instruction.SBC, AddressingMode.Absolute,  no, no
        @registerOperation 0xFD, Instruction.SBC, AddressingMode.AbsoluteX, no, no
        @registerOperation 0xF9, Instruction.SBC, AddressingMode.AbsoluteY, no, no
        @registerOperation 0xE1, Instruction.SBC, AddressingMode.IndirectX, no, no
        @registerOperation 0xF1, Instruction.SBC, AddressingMode.IndirectY, no, no

        ###########################################################
        # Shifting instructions
        ###########################################################
        
        @registerOperation 0x0A, Instruction.ASL, AddressingMode.Accumulator, no,  no
        @registerOperation 0x06, Instruction.ASL, AddressingMode.ZeroPage,    no,  yes
        @registerOperation 0x16, Instruction.ASL, AddressingMode.ZeroPageX,   no,  yes
        @registerOperation 0x0E, Instruction.ASL, AddressingMode.Absolute,    no,  yes
        @registerOperation 0x1E, Instruction.ASL, AddressingMode.AbsoluteX,   yes, yes

        @registerOperation 0xA9, Instruction.LSR, AddressingMode.Immediate,   no,  no
        @registerOperation 0xA5, Instruction.LSR, AddressingMode.ZeroPage,    no,  yes
        @registerOperation 0xB5, Instruction.LSR, AddressingMode.ZeroPageX,   no,  yes
        @registerOperation 0xAD, Instruction.LSR, AddressingMode.Absolute,    no,  yes
        @registerOperation 0xBD, Instruction.LSR, AddressingMode.AbsoluteX,   yes, yes

        @registerOperation 0x2A, Instruction.ROL, AddressingMode.Immediate,   no,  no
        @registerOperation 0x26, Instruction.ROL, AddressingMode.ZeroPage,    no,  yes
        @registerOperation 0x36, Instruction.ROL, AddressingMode.ZeroPageX,   no,  yes
        @registerOperation 0x2E, Instruction.ROL, AddressingMode.Absolute,    no,  yes
        @registerOperation 0x3E, Instruction.ROL, AddressingMode.AbsoluteX,   yes, yes

        @registerOperation 0x6A, Instruction.ROR, AddressingMode.Immediate,   no,  no
        @registerOperation 0x66, Instruction.ROR, AddressingMode.ZeroPage,    no,  yes
        @registerOperation 0x76, Instruction.ROR, AddressingMode.ZeroPageX,   no,  yes
        @registerOperation 0x6E, Instruction.ROR, AddressingMode.Absolute,    no,  yes
        @registerOperation 0x7E, Instruction.ROR, AddressingMode.AbsoluteX,   yes, yes

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycle, emptyWriteCycle) ->
        @operationsTable[operationCode] = 
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycle: emptyReadCycle
            emptyWriteCycle: emptyWriteCycle

module.exports = CPU
