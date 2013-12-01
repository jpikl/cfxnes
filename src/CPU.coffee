Bit0 = 1 << 0
Bit1 = 1 << 1
Bit2 = 1 << 2
Bit3 = 1 << 3
Bit4 = 1 << 4
Bit5 = 1 << 5
Bit6 = 1 << 6
Bit7 = 1 << 7

AddressingMode =
    Implied:          1
    Accumulator:      2
    Immediate:        3
    ZeroPage:         4
    IndexedXZeroPage: 5
    IndexedYZeroPage: 6
    Absolute:         7
    IndexedXAbsolute: 8
    IndexedYAbsolute: 9
    Relative:         10
    Indirect:         11
    IndexedXIndirect: 12
    IndirectIndexedY: 13

Instruction = 
    ADC:  1
    AND:  2
    ASL:  3
    BCC:  4
    BCS:  5
    BEQ:  6
    BIT:  7
    BMI:  8
    BNE:  9
    BPL: 10
    BRK: 11
    BVC: 12
    BVS: 13
    CLC: 14
    CLD: 15
    CLI: 16
    CLV: 17
    CMP: 18
    CPX: 19
    CPY: 20
    DEC: 21
    DEX: 22
    DEY: 23
    EOR: 24
    INC: 25
    INX: 26
    INY: 27
    JMP: 28

Interrupt =
    IRQ:   1
    NMI:   2
    Reset: 3

class CPU
    constructor: (@memory, @ppu, @apu) ->
        @init()
        @powerUp()

    init: ->
        @initAddressingModesTable()
        @initInstructionsTable()
        @initOperationsTable()

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

    step: ->
        @resolveInterrupt()
        operation = @readOperation()
        @emptyReadCycle = operation.emptyReadCycle
        @emptyWriteCycle = operation.emptyWriteCycle
        addressingMode = operation.addressingMode
        instruction = operation.instruction
        address = @computeAddress addressingMode
        @executeInstruction instruction address

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
        @interruptDisable = 1
        @programCounter = @readWord interruptVectorAddress

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
        @carryFlag        = (status & Bit0) != 0
        @zeroFlag         = (status & Bit1) != 0
        @interruptDisable = (status & Bit2) != 0
        @decimalMode      = (status & Bit3) != 0
        @breakCommand     = (status & Bit4) != 0
        @overflowFlag     = (status & Bit6) != 0
        @negativeFlag     = (status & Bit7) != 0

    tick: ->
        @cycle++
        @ppu.tick() for [1..3]
        @apu.tick()
        undefined

    reset: ->
        @setRequestedInterrupt Interrupt.Reset

    requestNonMaskableInterrupt: ->
        @setRequestedInterrupt Interrupt.NMI

    setRequestedInterrupt: (type) ->
        if @requestedInterrupt == null or type > @requestedInterrupt
            @requestedInterrupt = type 

    initAddressingModesTable: ->
        @addressingModesTable = []

        @registerAddressingMode AddressingMode.Implied, ->
            @tick()

        @registerAddressingMode AddressingMode.Accumulator, ->
            @tick()

        @registerAddressingMode AddressingMode.Immediate, ->
            @moveProgramCounter()

        @registerAddressingMode AddressingMode.ZeroPage, ->
            @readNextProgramByte()

        @registerAddressingMode AddressingMode.IndexedXZeroPage, ->
            @getIndexedAddressByte @readNextProgramByte(), @registerX

        @registerAddressingMode AddressingMode.IndexedYZeroPage, ->
            @getIndexedAddressByte @readNextProgramByte(), @registerY

        @registerAddressingMode AddressingMode.Absolute, ->
            @readNextProgramWord()

        @registerAddressingMode AddressingMode.IndexedXAbsolute, ->
            @getIndexedAddressWord @readNextProgramWord(), @registerX

        @registerAddressingMode AddressingMode.IndexedYAbsolute, ->
            @getIndexedAddressWord @readNextProgramWord(), @registerY

        @registerAddressingMode AddressingMode.Relative, ->
            offset = @getSignedByte @readNextProgramByte()
            @getIndexedAddressWord @programCounter, offset

        @registerAddressingMode AddressingMode.Indirect, ->
            @readWord @readNextProgramWord()

        @registerAddressingMode AddressingMode.IndexedXIndirect, ->
            address = @getIndexedAddressByte @readNextProgramByte(), @registerX
            @readWord address

        @registerAddressingMode AddressingMode.IndirectIndexedY, ->
            base = @readWord @readNextProgramByte()
            @getIndexedAddressWord base, @registerY

    registerAddressingMode: (addressingMode, computation) ->
        @addressingModesTable[addressingMode] = computation

    getIndexedAddressByte: (base, offset) ->
        @emptyReadCycle = yes
        (base + offset) & 0xFF

    getIndexedAddressWord : (base, offset) ->
        @emptyReadCycle = yes if base & 0xFF00 != (base + offset) & 0xFF00 # Page crossed
        (base + offset) & 0xFFFF

    getSignedByte: (value) ->
        if value < 0x80 then value else value - 0xFF

    initInstructionsTable: ->
        @instructionsTable = []

        @registerInstruction Instruction.ADC, (address) ->
            operand = @readByte address
            result = @accumulator + operand
            result++ if @carryFlag
            @computeCarryFlag result
            @computeZeroFlag result
            @computeOverflowFlag @accumulator, operand, result
            @computeNegativeFlag result
            @accumulator = result & 0xFF

        @registerInstruction Instruction.AND, (address) ->
            @accumulator &= @readByte address
            @computeZeroFlag @accumulator
            @computeNegativeFlag @accumulator

        @registerInstruction Instruction.ASL, (address) ->
            if address?
                result = (@readByte address) << 1
                @computeCarryFlag result
                @computeZeroFlag result
                @computeNegativeFlag result
                @writeByte address, result & 0xFF
            else
                result = @accumulator << 1
                @computeCarryFlag result
                @computeZeroFlag result
                @computeNegativeFlag result
                @accumulator = result & 0xFF

        @registerInstruction Instruction.BCC, (address) ->
            @branchIf @carryFlag is off, address

        @registerInstruction Instruction.BCS, (address) ->
            @branchIf @carryFlag is on, address

        @registerInstruction Instruction.BEQ, (address) ->
            @branchIf @zeroFlag is on, address

        @registerInstruction Instruction.BIT, (address) ->
            result = @accumulator & @readByte address
            @computeZeroFlag result
            @overflowFlag = result & Bit7 != 0 # Exception on overflow computation
            @computeNegativeFlag result

        @registerInstruction Instruction.BMI, (address) ->
            @branchIfTrue @negativeFlag, address

        @registerInstruction Instruction.BNE, (address) ->
            @branchIfFalse @zeroFlag,  address

        @registerInstruction Instruction.BPL, (address) ->
            @branchIfFalse @negativeFlag,  address

        @registerInstruction Instruction.BRK, ->
            @breakCommand = 1
            @handleInterrupt 0xFFFE

        @registerInstruction Instruction.BVC, (address) ->
            @branchIf @overflowFlag is off, address

        @registerInstruction Instruction.BVS, (address) ->
            @branchIf @overflowFlag is on,  address

        @registerInstruction Instruction.CLC, ->
            @carryFlag = off

        @registerInstruction Instruction.CLD, ->
            @decimalMode = off

        @registerInstruction Instruction.CLI, ->
            @interruptDisable = off

        @registerInstruction Instruction.CLV, ->
            @overflowFlag = off

        @registerInstruction Instruction.CMP, (address) ->
            @compareRegisterAndMemory @accumulator, address
            
        @registerInstruction Instruction.CPX, ->
            @compareRegisterAndMemory @registerX, address

        @registerInstruction Instruction.CPY, ->
            @compareRegisterAndMemory @registerY, address

        @registerInstruction Instruction.DEC, (address) ->
            result = (@readByte address) - 1
            @computeZeroFlag result
            @computeNegativeFlag result
            @writeByte address, result

        @registerInstruction Instruction.DEX, ->
            @registerX = (@registerX - 1) & 0xFF
            @computeZeroFlag @registerX
            @computeNegativeFlag @registerX

        @registerInstruction Instruction.DEY, ->
            @registerY = (@registerY - 1) & 0xFF
            @computeZeroFlag @registerY
            @computeNegativeFlag @registerY

        @registerInstruction Instruction.EOR, (address) ->
            @accumulator ^= @readByte address
            @computeZeroFlag @accumulator
            @computeNegativeFlag @accumulator

        @registerInstruction Instruction.INC, (address) ->
            result = (@readByte address) + 1
            @computeZeroFlag result
            @computeNegativeFlag result
            @writeByte address, result & 0xFF

        @registerInstruction Instruction.INX, ->
            @registerX = (@registerX + 1) & 0xFF
            @computeZeroFlag @registerX
            @computeNegativeFlag @registerX

        @registerInstruction Instruction.INY, ->
            @registerY = (@registerY + 1) & 0xFF
            @computeZeroFlag @registerY
            @computeNegativeFlag @registerY

        @registerInstruction Instruction.JMP, (address) ->
            @programCounter = address

    registerInstruction: (instruction, execution) ->
        @instructionsTable[instruction] = execution

    computeCarryFlag: (result) ->
        @carryFlag = result > 0xFF

    computeZeroFlag: (result) ->
        @zeroFlag = result & 0xFF != 0

    computeOverflowFlag: (operand1, operand2, result) ->
        @overflowFlag = (operand1 ^ result) & (operand2 ^ result) & Bit7 != 0

    computeNegativeFlag: (result) ->
        @negativeFlag = result & Bit7 != 0

    branchIf: (condition, address) ->
        if condition
            @programCounter = address
            @tick()

    compareRegisterAndMemory: (register, address) -> 
        operand = @readByte address
        result = register - operand 
        @carryFlag = result >= 0 # Exception on carry computation
        @computeZeroFlag result
        @computeNegativeFlag result

    initOperationsTable: ->
        @operationsTable = []

        @registerOperation 0x69, Instruction.ADC, AddressingMode.Immediate,        no,  no
        @registerOperation 0x65, Instruction.ADC, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0x75, Instruction.ADC, AddressingMode.IndexedXZeroPage, no,  no
        @registerOperation 0x6D, Instruction.ADC, AddressingMode.Absolute,         no,  no
        @registerOperation 0x7D, Instruction.ADC, AddressingMode.IndexedXAbsolute, no,  no
        @registerOperation 0x79, Instruction.ADC, AddressingMode.IndexedYAbsolute, no,  no
        @registerOperation 0x61, Instruction.ADC, AddressingMode.IndexedXIndirect, no,  no
        @registerOperation 0x71, Instruction.ADC, AddressingMode.IndirectIndexedY, no,  no

        @registerOperation 0x29, Instruction.AND, AddressingMode.Immediate,        no,  no
        @registerOperation 0x25, Instruction.AND, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0x35, Instruction.AND, AddressingMode.IndexedXZeroPage, no,  no
        @registerOperation 0x2D, Instruction.AND, AddressingMode.Absolute,         no,  no
        @registerOperation 0x3D, Instruction.AND, AddressingMode.IndexedXAbsolute, no,  no
        @registerOperation 0x39, Instruction.AND, AddressingMode.IndexedYAbsolute, no,  no
        @registerOperation 0x21, Instruction.AND, AddressingMode.IndexedXIndirect, no,  no
        @registerOperation 0x31, Instruction.AND, AddressingMode.IndirectIndexedY, no,  no
        
        @registerOperation 0x0A, Instruction.ASL, AddressingMode.Accumulator,      no,  no
        @registerOperation 0x06, Instruction.ASL, AddressingMode.ZeroPage,         no,  yes
        @registerOperation 0x16, Instruction.ASL, AddressingMode.IndexedXZeroPage, no,  yes
        @registerOperation 0x0E, Instruction.ASL, AddressingMode.Absolute,         no,  yes
        @registerOperation 0x1E, Instruction.ASL, AddressingMode.IndexedXAbsolute, yes, yes

        @registerOperation 0x90, Instruction.BCC, AddressingMode.Relative,         no,  no

        @registerOperation 0xB0, Instruction.BCS, AddressingMode.Relative,         no,  no

        @registerOperation 0xB0, Instruction.BEQ, AddressingMode.Relative,         no,  no

        @registerOperation 0x24, Instruction.BIT, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0x2C, Instruction.BIT, AddressingMode.Absolute,         no,  no

        @registerOperation 0x30, Instruction.BMI, AddressingMode.Relative,         no,  no

        @registerOperation 0xD0, Instruction.BNE, AddressingMode.Relative,         no,  no

        @registerOperation 0x10, Instruction.BPL, AddressingMode.Relative,         no,  no

        @registerOperation 0x00, Instruction.BRK, AddressingMode.Implied,          no,  no

        @registerOperation 0x50, Instruction.BVC, AddressingMode.Relative,         no,  no

        @registerOperation 0x70, Instruction.BVS, AddressingMode.Relative,         no,  no

        @registerOperation 0x18, Instruction.CLC, AddressingMode.Implied,          no,  no

        @registerOperation 0xD8, Instruction.CLD, AddressingMode.Implied,          no,  no

        @registerOperation 0x58, Instruction.CLI, AddressingMode.Implied,          no,  no

        @registerOperation 0xB8, Instruction.CLV, AddressingMode.Implied,          no,  no

        @registerOperation 0xC9, Instruction.CMP, AddressingMode.Immediate,        no,  no
        @registerOperation 0xC5, Instruction.CMP, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0xD5, Instruction.CMP, AddressingMode.IndexedXZeroPage, no,  no
        @registerOperation 0xCD, Instruction.CMP, AddressingMode.Absolute,         no,  no
        @registerOperation 0xDD, Instruction.CMP, AddressingMode.IndexedXAbsolute, no,  no
        @registerOperation 0xD9, Instruction.CMP, AddressingMode.IndexedYAbsolute, no,  no
        @registerOperation 0xC1, Instruction.CMP, AddressingMode.IndexedXIndirect, no,  no
        @registerOperation 0xD1, Instruction.CMP, AddressingMode.IndirectIndexedY, no,  no

        @registerOperation 0xE0, Instruction.CPX, AddressingMode.Immediate,        no,  no
        @registerOperation 0xE4, Instruction.CPX, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0xEC, Instruction.CPX, AddressingMode.Absolute,         no,  no

        @registerOperation 0xC0, Instruction.CPX, AddressingMode.Immediate,        no,  no
        @registerOperation 0xC4, Instruction.CPX, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0xCC, Instruction.CPX, AddressingMode.Absolute,         no,  no

        @registerOperation 0xC6, Instruction.DEC, AddressingMode.ZeroPage,         no,  yes
        @registerOperation 0xD6, Instruction.DEC, AddressingMode.IndexedXZeroPage, no,  yes
        @registerOperation 0xCE, Instruction.DEC, AddressingMode.Absolute,         no,  yes
        @registerOperation 0xDE, Instruction.DEC, AddressingMode.IndexedXAbsolute, yes, yes

        @registerOperation 0xCA, Instruction.DEX, AddressingMode.Implied,          no,  no

        @registerOperation 0x88, Instruction.DEY, AddressingMode.Implied,          no,  no

        @registerOperation 0x49, Instruction.EOR, AddressingMode.Immediate,        no,  no
        @registerOperation 0x45, Instruction.EOR, AddressingMode.ZeroPage,         no,  no
        @registerOperation 0x55, Instruction.EOR, AddressingMode.IndexedXZeroPage, no,  no
        @registerOperation 0x4D, Instruction.EOR, AddressingMode.Absolute,         no,  no
        @registerOperation 0x5D, Instruction.EOR, AddressingMode.IndexedXAbsolute, no,  no
        @registerOperation 0x59, Instruction.EOR, AddressingMode.IndexedYAbsolute, no,  no
        @registerOperation 0x41, Instruction.EOR, AddressingMode.IndexedXIndirect, no,  no
        @registerOperation 0x51, Instruction.EOR, AddressingMode.IndirectIndexedY, no,  no

        @registerOperation 0xC6, Instruction.INC, AddressingMode.ZeroPage,         no,  yes
        @registerOperation 0xD6, Instruction.INC, AddressingMode.IndexedXZeroPage, no,  yes
        @registerOperation 0xCE, Instruction.INC, AddressingMode.Absolute,         no,  yes
        @registerOperation 0xDE, Instruction.INC, AddressingMode.IndexedXAbsolute, yes, yes

        @registerOperation 0xCA, Instruction.INX, AddressingMode.Implied,          no,  no

        @registerOperation 0x88, Instruction.INY, AddressingMode.Implied,          no,  no

        @registerOperation 0x4C, Instruction.INY, AddressingMode.Absolute,         no,  no
        @registerOperation 0x6C, Instruction.INY, AddressingMode.Indirect,         no,  no

    registerOperation: (operationCode, instruction, addressingMode, emptyReadCycle, emptyWriteCycle) ->
        @operationsTable[operationCode] = 
            instruction: instruction
            addressingMode: addressingMode
            emptyReadCycle: emptyReadCycle
            emptyWriteCycle: emptyWriteCycle

module.exports = CPU
