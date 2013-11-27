AddressingMode =
	ZeroPage: 1
	// TODO add all addressing modes

Instruction =
	ADC: 1
	// TODO add all instructions

class CPU
	constructor(@memory): ->
		@initAddressingModesTable()
		@initInstructionsTable()
		@initOperationsTable()
		@reset()

	initAddressingModesTable: ->
		@addressingModesTable = []
		@registerAddressingMode AddressingMode.ZeroPage, () ->
			// TODO addressing mode code
		// TODO add all addressing modes

	registerAddressingMode: (addressingMode, computation) ->
		@addressingModesTable[addressingMode] = computation

	initInstructionsTable: ->
		@instructionsTable = []
		@registerInstruction Instruction.ADC, (address) ->
			// TODO instruction code
		// TODO add all instructions

	registerInstruction: (instruction, execution) ->
		@instructionsTable[instruction] = execution

	initOperationsTable: ->
		@operationsTable = []
		@registerOperation 0x65 Instruction.ADC, AddressingMode.ZeroPage, 2, 2
		// TODO add all operations

	registerOperation: (operationCode, instruction, addressingMode, size, cycles) ->
		@operationsTable[operationCode] =
			instruction: instruction
			addressingMode: addressingMode
			size: size
			cycles: cycles

	reset: ->
		@resetRegistres()
		@resetFlags()

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

	step: ->
		operation = @readOperation
		address = @computeAddress operation.addressingMode
		// TODO implement rest

	readOperation: () ->
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