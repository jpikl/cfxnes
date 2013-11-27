Instruction =
	ADC: 1
	// TODO add all instructions

AddressingMode =
	ZeroPage: 1
	// TODO add all addressing modes

class CPU
	constructor(@memory): ->
		@initInstructionsTable()
		@reset()

	initInstructionsTable: ->
		@instructionsTable = []
		@registerInstruction 0x65 Instruction.ADC, AddressingMode.ZeroPage, 2, 2
		// TODO add instructions for all operations codes

	registerInstruction: (operationCode, instruction, addressingMode, size, cycles) ->
		@instructionsTable[operationCode] =
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
		operationCode = @read @programCounter
		instructionData = @instructionsTable[operationCode]
		instruction = @instructionData.instruction
		addressingMode = @instructionData.addressingMode
		size = @instructionData.size
		cycles = @instructionData.cycles
		// TODO implement rest

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