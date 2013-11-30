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
    ADC: 1
    # TODO add all instructions

class CPU
    constructor: (@memory) ->
        @initAddressingModesTable()
        @initInstructionsTable()
        @initOperationsTable()
        @reset()

    initAddressingModesTable: ->
        @addressingModesTable = []
        @registerAddressingMode AddressingMode.Implied, ->
        @registerAddressingMode AddressingMode.Accumulator, ->
        @registerAddressingMode AddressingMode.Immediate, ->

        @registerAddressingMode AddressingMode.ZeroPage, ->
            @read @programCounter + 1

        @registerAddressingMode AddressingMode.IndexedXZeroPage, ->
            base = @read @programCounter + 1
            (base + @registerX) & 0xFF

        @registerAddressingMode AddressingMode.IndexedXZeroPage, ->
            @read @programCounter + 1
            (base + @registerY) & 0xFF

        @registerAddressingMode AddressingMode.Absolute, ->
            @read16 @programCounter + 1

        @registerAddressingMode AddressingMode.IndexedXAbsolute, ->
            base = @read16 @programCounter + 1
            @checkPageCrossed base, @registerX
            (base + @registerX) & 0xFFFF

        @registerAddressingMode AddressingMode.IndexedXAbsolute, ->
            base = @read16 @programCounter + 1
            @checkPageCrossed base, @registerY
            (base + @registerX) & 0xFFFF

        @registerAddressingMode AddressingMode.Relative, ->
            offset = @read @programCounter + 1
            (@programCounter + @toSigned offset) & 0xFFFF

        @registerAddressingMode AddressingMode.Indirect, ->
            @read16 @read16 @programCounter + 1

        @registerAddressingMode AddressingMode.IndexedXIndirect, ->
            base = @read @programCounter + 1
            @read16 (base + @registerX) & 0xFF

        @registerAddressingMode AddressingMode.IndirectIndexedY, ->
            base = @read16 @read @programCounter + 1
            @checkPageCrossed base, @registerY
            (base + @registerY) & 0xFFFF

    registerAddressingMode: (addressingMode, computation) ->
        @addressingModesTable[addressingMode] = computation

    initInstructionsTable: ->
        @instructionsTable = []
        @registerInstruction Instruction.ADC, (address) ->
            # TODO instruction code
        # TODO add all instructions

    registerInstruction: (instruction, execution) ->
        @instructionsTable[instruction] = execution

    initOperationsTable: ->
        @operationsTable = []
        @registerOperation 0x65, Instruction.ADC, AddressingMode.ZeroPage, 2, 2
        # TODO add all operations

    registerOperation: (operationCode, instruction, addressingMode, size, cycles) ->
        @operationsTable[operationCode] =
            instruction: instruction
            addressingMode: addressingMode
            size: size
            cycles: cycles

    reset: ->
        @resetRegistres()
        @resetFlags()
        @resetOthers()

    resetRegistres: ->
        @programCounter = 0
        @stackPointer = 0xFF
        @accumulator = 0
        @registerX = 0
        @registerY = 0

    resetFlags: ->
        @carryFlag = 0
        @zeroFlag = 0
        @decimalMode = 0
        @breakCommand = 0
        @overflowFlag = 0
        @negativeFlag = 0

    resetOthers: ->
        @pageCrossed = false

    step: ->
        operation = @readOperation
        address = @computeAddress operation.addressingMode
        cycles = operation.cycles
        cycles += 1 if @pageCrossed
        @pageCrossed = false
        # TODO implement rest

    readOperation: ->
        operationCode = @read @programCounter
        @operationsTable[operationCode]

    computeAddress: (addressingMode) ->
        @addressingModesTable[addressingMode]()

    executeInstruction: (instruction, address) ->
        @instructionsTable[instruction](address)

    push: (value) ->
        @stackPointer = (@stackPointer - 1) & 0xFF
        @write 0x100 + @stackPointer, value

    pop: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @read 0x100 + @stackPointer

    read: (address) ->
        @memory.read address

    read16: (address) ->
        (@read address + 1) << 8 | @read address

    write: (address, value) ->
        @memory.write address, value

    write16: (address, value) ->
        @write address, value & 0xFF
        @write address + 1, value >> 8

    toSigned: (value) ->
        if value < 0x80 then value else value - 0xFF

    checkPageCrossed: (base, offset) ->
        @pageCrossed = base & 0xFF00 != (base + offset) & 0xFF00
