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

Interrupt =
    IRQ:   1
    NMI:   2
    Reset: 3

class CPU
    constructor: (@memory) ->
        @initAddressingModesTable()
        @initInstructionsTable()
        @initOperationsTable()
        @resetRegistres()
        @resetFlags()
        @resetOthers()

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

    resetRegistres: ->
        @programCounter = 0  # 16-bit
        @stackPointer = 0xFF # 8-bit
        @accumulator = 0     # 8-bit
        @registerX = 0       # 8-bit
        @registerY = 0       # 8-bit

    resetFlags: ->
        @carryFlag = 0
        @zeroFlag = 0
        @interruptDisable = 0
        @decimalMode = 0
        @breakCommand = 0
        @overflowFlag = 0
        @negativeFlag = 0

    resetOthers: ->
        @pageCrossed = false
        @requestedInterrupt = null

    step: ->
        @checkInterrupt()
        operation = @readOperation
        address = @computeAddress operation.addressingMode
        cycles = operation.cycles
        cycles += 1 if @pageCrossed
        @pageCrossed = false
        @programCounter += cycles

    checkInterrupt: ->
        if requestedInterrupt? and not @interruptDisable
            switch requestedInterrupt
                when Interrupt.IRQ   then @handleInterrupt 0xFFFE
                when Interrupt.NMI   then @handleInterrupt 0xFFFA
                when Interrupt.Reset then @handleInterrupt 0xFFFC
            requestedInterrupt = null

    handleInterrupt: (interruptVectorAddress)->
        @push16 @programCounter
        @push @getStatus()
        @interruptDisable = 1
        @programCounter = @read16 interruptVectorAddress

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

    push16: (value) ->
        @push (value >> 8) & 0xFF
        @push value & 0xFF

    pop: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @read 0x100 + @stackPointer

    pop16: ->
        result = @pop()
        result |= @pop() << 8

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

    getStatus: ->
        status = @carryFlag
        status |= @zeroFlag << 1 
        status |= @interruptDisable << 2
        status |= @decimalMode << 3 
        status |= @breakCommand << 4
        status |= @overflowFlag << 6
        status |= @negativeFlag << 7

    setStatus: (status) ->
        @carryFlag = status & 1
        @zeroFlag = (status >> 1) & 1
        @interruptDisable = (status >> 2) & 1
        @decimalMode = (status >> 3) & 1
        @breakCommand = (status >> 4) & 1
        @overflowFlag = (status >> 6) & 1
        @negativeFlag = (status >> 7) & 1

    reset: ->
        @requestedInterrupt = Interrupt.Reset

    requestNonMaskableInterrupt: ->
        @requestedInterrupt = Interrupt.NMI

module.exports = CPU
