Interrupt = require("../common/types").Interrupt
byteAsHex = require("../utils/format").byteAsHex
logger    = require("../utils/logger").get()

###########################################################
# Central processing unit
###########################################################

class CPU

    @dependencies: [ "cpuMemory", "ppu", "apu", "dma" ]

    init: (cpuMemory, ppu, apu, dma) ->
        @cpuMemory = cpuMemory
        @ppu = ppu
        @apu = apu
        @dma = dma
        @initOperationsTable()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting CPU"
        @resetRegisters()
        @resetVariables()
        @resetMemory()
        @handleReset() # Reset will appropriately initialize some CPU registers and $4015/$4017 registers (see bellow)

    resetRegisters: ->
        @programCounter = 0 # 16-bit (it will be initialized to value at address 0xFFFC during following reset)
        @stackPointer = 0   #  8-bit (it will be set to 0x7D during following reset)
        @accumulator = 0    #  8-bit
        @registerX = 0      #  8-bit
        @registerY = 0      #  8-bit
        @setStatus 0        #  8-bit (it will be initialized to 0x34 during following reset; actually only bit 2 will be set,
                            #         because bits 4 and 5 are not physically stored in status register)

    resetVariables: ->
        @cyclesCount = 0
        @emptyReadCycles = 0  # Number of dummy write cycles
        @emptyWriteCycles = 0 # Number of dummy read cycles
        @activeInterrupts = 0 # Bitmap of active interrupts (each type of interrupt has its own bit)
        @halted = false       # Whether KIL opcode was readed

    resetMemory: ->
        @write address, 0xFF for address in [0...0x0800]
        @write 0x0008, 0xF7
        @write 0x0009, 0xEF
        @write 0x000A, 0xDF
        @write 0x000F, 0xBF
        @write address, 0x00 for address in [0x4000...0x4010]
        # Writes to $4015 and $4017 are done during following reset

    ###########################################################
    # Execution step
    ###########################################################

    step: ->
        blocked = @dma.isBlockingCPU() or @apu.isBlockingCPU()
        if @activeInterrupts and not blocked
            @resolveInterrupt()
        if @halted or blocked
            @tick() # Tick everything else
        else
            @executeOperation()

    ###########################################################
    # Interrupt handling
    ###########################################################

    resolveInterrupt: ->
        if @activeInterrupts & Interrupt.RESET
            @handleReset()
        else if @activeInterrupts & Interrupt.NMI
            @handleNMI()
        else if @interruptDisable
            return # IRQ requested, but disabled
        else
            @handleIRQ()
        @tick()
        @tick() # To make totally 7 cycles during interrupt

    handleReset: ->
        @write 0x4015, 0x00                              # Disable all APU channels immediatelly
        @write 0x4017, @apu.frameCounterLastWrittenValue # It's allways 0 on power up (which will disable all APU channels)
        @stackPointer = (@stackPointer - 3) & 0xFF       # Unlike IRQ/NMI, writing on stack here does not modify CPU memory, so we just decrement the stack pointer 3 times
        @tick() for [1..3]                               # 3 "dummy" writes, mentioned above
        @enterInterruptHandler 0xFFFC
        @clearInterrupt Interrupt.RESET
        @halted = false

    handleNMI: ->
        @saveStateBeforeInterrupt()
        @enterInterruptHandler 0xFFFA
        @clearInterrupt Interrupt.NMI

    handleIRQ: ->
        @saveStateBeforeInterrupt()
        @enterInterruptHandler 0xFFFE
        # Unlike reset/NMI, the interrupt flag is not cleared

    saveStateBeforeInterrupt: ->
        @pushWord @programCounter
        @pushByte @getStatus()

    enterInterruptHandler: (address) ->
        @interruptDisable = 1
        @programCounter = @readWord address

    ###########################################################
    # Program execution
    ###########################################################

    executeOperation: ->
        operation = @$readOperation()
        unless operation
            logger.info "CPU halted!"
            @halted = true # CPU halt (KIL operation code)
            return

        instruction = operation.instruction
        addressingMode = operation.addressingMode

        @pageCrossed = false
        @pageCrossEnabled = operation.pageCrossEnabled
        @emptyReadCycles = operation.emptyReadCycles
        @emptyWriteCycles = operation.emptyWriteCycles

        address = addressingMode.call this
        instruction.call this, address

    readOperation: ->
        @operationsTable[@$readNextProgramByte()]

    readNextProgramByte: ->
        @$readByte @$moveProgramCounter 1

    readNextProgramWord: ->
        @$readWord @$moveProgramCounter 2

    moveProgramCounter: (size) ->
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
        @$read address

    readWord: (address) ->
        highByte = @$readByte (address + 1) & 0xFFFF
        highByte << 8 | @$readByte address

    readWordFromSamePage: (address) ->
        highByte = @$readByte address & 0xFF00 | (address + 1) & 0x00FF
        highByte << 8 | @$readByte address

    write: (address, value) ->
        @cpuMemory.write address, value

    writeByte: (address, value) ->
        @resolveWriteCycles()
        @$write address, value

    writeWord: (address, value) ->
        @$writeByte address, value & 0xFF
        @$writeByte (address + 1) & 0xFFFF, value >>> 8

    ###########################################################
    # Stack pushing / pulling
    ###########################################################

    pushByte: (value) ->
        @$writeByte 0x100 + @stackPointer, value
        @stackPointer = (@stackPointer - 1) & 0xFF

    pushWord: (value) ->
        @$pushByte value >>> 8
        @$pushByte value & 0xFF

    popByte: ->
        @stackPointer = (@stackPointer + 1) & 0xFF
        @$readByte 0x100 + @stackPointer

    popWord: ->
        @$popByte() | @$popByte() << 8

    ###########################################################
    # Memory reading / writing cycles handling
    ###########################################################

    resolveReadCycles: ->
        @tick()
        if @emptyReadCycles
            @emptyReadCycles--
            @tick()

    resolveWriteCycles: ->
        @tick()
        if @emptyWriteCycles
            @emptyWriteCycles--
            @tick()

    tick: ->
        @cyclesCount++
        @dma.tick() unless @apu.isBlockingDMA()
        @ppu.tick() for [1..3]
        @apu.tick()
        undefined

    ###########################################################
    # CPU status reading / writing
    ###########################################################

    # Bits 4 and 5 are not physically stored in status register
    # - bit 4 is written on stack as 1 during PHP/BRK instructions (break command flag)
    # - bit 5 is written on stack as 1 during PHP/BRK instructions and IRQ/NMI

    getStatus: ->
        @carryFlag             | # S[0] - carry bit of the last operation
        @zeroFlag         << 1 | # S[1] - whether result of the last operation was zero
        @interruptDisable << 2 | # S[2] - whether IRQs are disabled (this does not affect NMI/reset)
        @decimalMode      << 3 | # S[3] - NES CPU actually does not use this flag, but is stored in status register and modified by CLD/SED instructions
        1                 << 5 | # S[5] - allways 1, see comment above
        @overflowFlag     << 6 | # S[6] - wheter result of the last operation caused overflow
        @negativeFlag     << 7   # S[7] - wheter result of the last operation was negative number (bit 7 of result was 1)

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

    activateInterrupt: (type) ->
        @activeInterrupts |= type

    clearInterrupt: (type) ->
        @activeInterrupts &= ~type

    ###########################################################
    # Basic addressing modes
    ###########################################################

    impliedMode: ->
        @tick()

    accumulatorMode: ->
        @tick()

    immediateMode: ->
        @$moveProgramCounter 1

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: ->
        @$readNextProgramByte()

    zeroPageXMode: ->
        @$getIndexedAddressByte @$readNextProgramByte(), @registerX

    zeroPageYMode: ->
        @$getIndexedAddressByte @$readNextProgramByte(), @registerY

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: ->
        @$readNextProgramWord()

    absoluteXMode: ->
        @$getIndexedAddressWord @$readNextProgramWord(), @registerX

    absoluteYMode: ->
        @$getIndexedAddressWord @$readNextProgramWord(), @registerY

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: ->
        base = (@programCounter + 1) & 0xFFFF # We need to get address of the next instruction
        offset = @$getSignedByte @$readNextProgramByte()
        @$getIndexedAddressWord base, offset

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: ->
        @$readWordFromSamePage @$readNextProgramWord()

    indirectXMode: ->
        @$readWordFromSamePage @zeroPageXMode()

    indirectYMode: ->
        base = @$readWordFromSamePage @$readNextProgramByte()
        @$getIndexedAddressWord base, @registerY

    ###########################################################
    # Address computation
    ###########################################################

    getIndexedAddressByte: (base, offset) ->
        (base + offset) & 0xFF

    getIndexedAddressWord : (base, offset) ->
        @pageCrossed = (base & 0xFF00) != ((base + offset) & 0xFF00)
        @emptyReadCycles++ if @pageCrossEnabled and @pageCrossed
        (base + offset) & 0xFFFF

    getSignedByte: (value) ->
        if value >= 0x80 then value - 0x100 else value

    ###########################################################
    # No operation instruction
    ###########################################################

    NOP: ->

    ###########################################################
    # Clear flag instructions
    ###########################################################

    CLC: ->
        @carryFlag = 0

    CLI: ->
        @interruptDisable = 0

    CLD: ->
        @decimalMode = 0

    CLV: ->
        @overflowFlag = 0

    ###########################################################
    # Set flag instructions
    ###########################################################

    SEC: ->
        @carryFlag = 1

    SEI: ->
        @interruptDisable = 1

    SED: ->
        @decimalMode = 1

    ###########################################################
    # Memory write instructions
    ###########################################################

    STA: (address) ->
        @$writeByte address, @accumulator

    STX: (address) ->
        @$writeByte address, @registerX

    SAX: (address) ->
        @$writeByte address, @accumulator & @registerX

    STY: (address) ->
        @$writeByte address, @registerY

    SHA: (address) -> # Also known as AHX
        @$storeHighAddressIntoMemory address, @accumulator & @registerX

    SHX: (address) -> # Also known as SXA
        @$storeHighAddressIntoMemory address, @registerX

    SHY: (address) -> # Also known as SYA
        @$storeHighAddressIntoMemory address, @registerY

    ###########################################################
    # Memory read instructions
    ###########################################################

    LDA: (address) ->
        @$storeValueIntoAccumulator @$readByte address

    LDX: (address) ->
        @$storeValueIntoRegisterX @$readByte address

    LDY: (address) ->
        @$storeValueIntoRegisterY @$readByte address

    LAX: (address) ->
        value = @$readByte address
        @$storeValueIntoAccumulator value
        @$storeValueIntoRegisterX value

    LAS: (address) ->
        @stackPointer &= @$readByte address
        @$storeValueIntoAccumulator @stackPointer
        @$storeValueIntoRegisterX @stackPointer

    ###########################################################
    # Register transfer instructions
    ###########################################################

    TAX: ->
        @$storeValueIntoRegisterX @accumulator

    TAY: ->
        @$storeValueIntoRegisterY @accumulator

    TXA: ->
        @$storeValueIntoAccumulator @registerX

    TYA: ->
        @$storeValueIntoAccumulator @registerY

    TSX: ->
        @$storeValueIntoRegisterX @stackPointer

    TXS: ->
        @stackPointer = @registerX

    ###########################################################
    # Stack push instructions
    ###########################################################

    PHA: ->
        @$pushByte @accumulator

    PHP: ->
        @$pushByte @$getStatus() | 0x10 # It pushes status with bit 4 on (break command flag)

    ###########################################################
    # Stack pop instructions
    ###########################################################

    PLA: ->
        @$storeValueIntoAccumulator @$popByte()

    PLP: ->
        @$setStatus @$popByte()

    ###########################################################
    # Accumulator bitwise instructions
    ###########################################################

    AND: (address) ->
        @$storeValueIntoAccumulator @accumulator & @$readByte address

    ORA: (address) ->
        @$storeValueIntoAccumulator @accumulator | @$readByte address

    EOR: (address) ->
        @$storeValueIntoAccumulator @accumulator ^ @$readByte address

    BIT: (address) ->
        value = @$readByte address
        @zeroFlag = (@accumulator & value) == 0
        @overflowFlag = (value >>> 6) & 1
        @negativeFlag = (value >>> 7) & 1

    ###########################################################
    # Increment instructions
    ###########################################################

    INC: (address) ->
        @$storeValueIntoMemory address, ((@$readByte address) + 1) & 0xFF

    INX: ->
        @$storeValueIntoRegisterX (@registerX + 1) & 0xFF

    INY: ->
        @$storeValueIntoRegisterY (@registerY + 1) & 0xFF

    ###########################################################
    # Decrement instructions
    ###########################################################

    DEC: (address) ->
        @$storeValueIntoMemory address, ((@$readByte address) - 1) & 0xFF

    DEX: ->
        @$storeValueIntoRegisterX (@registerX - 1) & 0xFF

    DEY: ->
        @$storeValueIntoRegisterY (@registerY - 1) & 0xFF

    ###########################################################
    # Comparison instructions
    ###########################################################

    CMP: (address) ->
        @$compareRegisterAndMemory @accumulator, address

    CPX: (address) ->
        @$compareRegisterAndMemory @registerX, address

    CPY: (address) ->
        @$compareRegisterAndMemory @registerY, address

    ###########################################################
    # Branching instructions
    ###########################################################

    BCC: (address) ->
        @$branchIf not @carryFlag, address

    BCS: (address) ->
        @$branchIf @carryFlag, address

    BNE: (address) ->
        @$branchIf not @zeroFlag, address

    BEQ: (address) ->
        @$branchIf @zeroFlag, address

    BVC: (address) ->
        @$branchIf not @overflowFlag, address

    BVS: (address) ->
        @$branchIf @overflowFlag,  address

    BPL: (address) ->
        @$branchIf not @negativeFlag, address

    BMI: (address) ->
        @$branchIf @negativeFlag, address

    ###########################################################
    # Jump / subroutine instructions
    ###########################################################

    JMP: (address) ->
        @programCounter = address

    JSR: (address) ->
        @$pushWord (@programCounter - 1) & 0xFFFF # The pushed address must be the end of the current instruction
        @programCounter = address

    RTS: ->
        @programCounter = (@$popWord() + 1) & 0xFFFF # We decremented the address when pushing it during JSR
        @tick()

    ###########################################################
    # Interrupt control instructions
    ###########################################################

    BRK: ->
        @$moveProgramCounter 1 # BRK is 2 byte instruction
        @$pushWord @programCounter
        @$pushByte @$getStatus() | 0x10 # It pushes status with bit 4 on (break command flag)
        @interruptDisable = 1
        @programCounter = @$readWord 0xFFFE

    RTI: ->
        @$setStatus @$popByte()
        @programCounter = @$popWord()

    ###########################################################
    # Addition / subtraction instructions
    ###########################################################

    ADC: (address) ->
        @$addValueToAccumulator @$readByte address

    SBC: (address) ->
        @$addValueToAccumulator (@$readByte address) ^ 0xFF # With internal carry incremment makes negative operand

    ###########################################################
    # Shifting / rotation instructions
    ###########################################################

    ASL: (address) ->
        @$rotateAccumulatorOrMemory address, @rotateLeft, false

    LSR: (address) ->
        @$rotateAccumulatorOrMemory address, @rotateRight, false

    ROL: (address) ->
        @$rotateAccumulatorOrMemory address, @rotateLeft, true

    ROR: (address) ->
        @$rotateAccumulatorOrMemory address, @rotateRight, true

    ###########################################################
    # Hybrid instructions
    ###########################################################

    DCP: (address) ->
        @$compareRegisterAndOperand @accumulator, @DEC address

    ISB: (address) ->
        @$addValueToAccumulator (@INC address) ^ 0xFF # With internal carry incremment makes negative operand

    SLO: (address) ->
        @$storeValueIntoAccumulator @accumulator | @ASL address

    SRE: (address) ->
        @$storeValueIntoAccumulator @accumulator ^ @LSR address

    RLA: (address) ->
        @$storeValueIntoAccumulator @accumulator & @ROL address

    XAA: (address) -> # Also known as ANE
        @$storeValueIntoAccumulator @registerX & @AND address

    RRA: (address) ->
        @$addValueToAccumulator @ROR address

    AXS: (address) -> # Also known as SBX
        @registerX = @compareRegisterAndMemory @accumulator & @registerX, address

    ANC: (address) ->
        @$rotateLeft @AND(address), false # rotateLeft computes carry

    ALR: (address) ->
        @AND address
        @LSR()

    ARR: (address) ->
        @AND address
        @ROR()
        @carryFlag = (@accumulator >>> 6) & 1
        @overflowFlag = ((@accumulator >>> 5) & 1) ^ @carryFlag

    TAS: (address) -> # Also known as SHS
        @stackPointer = @accumulator & @registerX
        @SHA address

    ###########################################################
    # Instruction helper functions
    ###########################################################

    storeValueIntoAccumulator: (value) ->
        @$updateZeroAndNegativeFlag value
        @accumulator = value

    storeValueIntoRegisterX: (value) ->
        @$updateZeroAndNegativeFlag value
        @registerX = value

    storeValueIntoRegisterY: (value) ->
        @$updateZeroAndNegativeFlag value
        @registerY = value

    storeValueIntoMemory: (address, value) ->
        @$updateZeroAndNegativeFlag value
        @$writeByte address, value

    storeHighAddressIntoMemory: (address, register) ->
        if @pageCrossed
            @$writeByte address, @read address # Just copy the same value
        else
            @$writeByte address, register & ((address >>> 8) + 1)

    addValueToAccumulator: (operand) ->
        result = @accumulator + operand + @carryFlag
        @carryFlag = (result >>> 8) & 1
        @overflowFlag = (((@accumulator ^ result) & (operand ^ result)) >>> 7) & 1 # Signed overflow
        @$storeValueIntoAccumulator result & 0xFF

    compareRegisterAndMemory: (register, address) ->
        @$compareRegisterAndOperand register, @$readByte address

    compareRegisterAndOperand: (register, operand) ->
        result = register - operand
        @carryFlag = result >= 0 # Unsigned comparison (bit 8 is actually the result sign)
        @$updateZeroAndNegativeFlag result # Not a signed comparison
        result & 0xFF

    branchIf: (condition, address) ->
        if condition
            @programCounter = address
            @tick()
            @tick() if @pageCrossed

    rotateAccumulatorOrMemory: (address, rotation, transferCarry) ->
        if address?
            result = rotation (@$readByte address), transferCarry
            @$storeValueIntoMemory address, result
        else
            result = rotation @accumulator, transferCarry
            @$storeValueIntoAccumulator result

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

        @registerOperation 0x1A, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x3A, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x5A, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x7A, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xDA, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xEA, @NOP, @impliedMode,   0, 0, 0 # 2 cycles
        @registerOperation 0xFA, @NOP, @impliedMode,   0, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x80, @NOP, @immediateMode, 0, 1, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x82, @NOP, @immediateMode, 0, 1, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x89, @NOP, @immediateMode, 0, 1, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xC2, @NOP, @immediateMode, 0, 1, 0 # 2 cycles (undocumented operation)
        @registerOperation 0xE2, @NOP, @immediateMode, 0, 1, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x04, @NOP, @zeroPageMode,  0, 1, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x44, @NOP, @zeroPageMode,  0, 1, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x64, @NOP, @zeroPageMode,  0, 1, 0 # 3 cycles (undocumented operation)

        @registerOperation 0x14, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x34, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x54, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x74, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)
        @registerOperation 0xD4, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)
        @registerOperation 0xF4, @NOP, @zeroPageXMode, 0, 2, 0 # 4 cycles (undocumented operation)

        @registerOperation 0x0C, @NOP, @absoluteMode,  0, 1, 0 # 4 cycles (undocumented operation)

        @registerOperation 0x1C, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0x3C, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0x5C, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0x7C, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0xDC, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0xFC, @NOP, @absoluteXMode, 1, 1, 0 # 4 (+1) cycles (undocumented operation)

        ###########################################################
        # Clear flag instructions
        ###########################################################

        @registerOperation 0x18, @CLC, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x58, @CLI, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0xD8, @CLD, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0xB8, @CLV, @impliedMode, 0, 0, 0 # 2 cycles

        ###########################################################
        # Set flag instructions
        ###########################################################

        @registerOperation 0x38, @SEC, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x78, @SEI, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0xF8, @SED, @impliedMode, 0, 0, 0 # 2 cycles

        ###########################################################
        # Memory write instructions
        ###########################################################

        @registerOperation 0x85, @STA, @zeroPageMode,  0, 0, 0 # 3 cycles
        @registerOperation 0x95, @STA, @zeroPageXMode, 0, 1, 0 # 4 cycles
        @registerOperation 0x8D, @STA, @absoluteMode,  0, 0, 0 # 4 cycles
        @registerOperation 0x9D, @STA, @absoluteXMode, 0, 1, 0 # 5 cycles
        @registerOperation 0x99, @STA, @absoluteYMode, 0, 1, 0 # 5 cycles
        @registerOperation 0x81, @STA, @indirectXMode, 0, 1, 0 # 6 cycles
        @registerOperation 0x91, @STA, @indirectYMode, 0, 1, 0 # 6 cycles

        @registerOperation 0x86, @STX, @zeroPageMode,  0, 0, 0 # 3 cycles
        @registerOperation 0x96, @STX, @zeroPageYMode, 0, 1, 0 # 4 cycles
        @registerOperation 0x8E, @STX, @absoluteMode,  0, 0, 0 # 4 cycles

        @registerOperation 0x87, @SAX, @zeroPageMode,  0, 0, 0 # 3 cycles (undocumented operation)
        @registerOperation 0x97, @SAX, @zeroPageYMode, 0, 1, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x8F, @SAX, @absoluteMode,  0, 0, 0 # 4 cycles (undocumented operation)
        @registerOperation 0x83, @SAX, @indirectXMode, 0, 1, 0 # 6 cycles (undocumented operation)

        @registerOperation 0x84, @STY, @zeroPageMode,  0, 0, 0 # 3 cycles
        @registerOperation 0x94, @STY, @zeroPageXMode, 0, 1, 0 # 4 cycles
        @registerOperation 0x8C, @STY, @absoluteMode,  0, 0, 0 # 4 cycles

        @registerOperation 0x93, @SHA, @indirectYMode, 0, 1, 0 # 6 cycles (undocumented operation)
        @registerOperation 0x9F, @SHA, @absoluteYMode, 0, 1, 0 # 5 cycles (undocumented operation)
        @registerOperation 0x9E, @SHX, @absoluteYMode, 0, 1, 0 # 5 cycles (undocumented operation)
        @registerOperation 0x9C, @SHY, @absoluteXMode, 0, 1, 0 # 5 cycles (undocumented operation)

        ###########################################################
        # Memory read instructions
        ###########################################################

        @registerOperation 0xA9, @LDA, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xA5, @LDA, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xB5, @LDA, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0xAD, @LDA, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0xBD, @LDA, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xB9, @LDA, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xA1, @LDA, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0xB1, @LDA, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0xA2, @LDX, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xA6, @LDX, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xB6, @LDX, @zeroPageYMode, 0, 1, 0 # 4      cycles
        @registerOperation 0xAE, @LDX, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0xBE, @LDX, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles

        @registerOperation 0xA0, @LDY, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xA4, @LDY, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xB4, @LDY, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0xAC, @LDY, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0xBC, @LDY, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles

        @registerOperation 0xAB, @LAX, @immediateMode, 0, 0, 0 # 2      cycles (undocumented operation)
        @registerOperation 0xA7, @LAX, @zeroPageMode,  0, 0, 0 # 3      cycles (undocumented operation)
        @registerOperation 0xB7, @LAX, @zeroPageYMode, 0, 1, 0 # 4      cycles (undocumented operation)
        @registerOperation 0xAF, @LAX, @absoluteMode,  0, 0, 0 # 4      cycles (undocumented operation)
        @registerOperation 0xBF, @LAX, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles (undocumented operation)
        @registerOperation 0xA3, @LAX, @indirectXMode, 0, 1, 0 # 6      cycles (undocumented operation)
        @registerOperation 0xB3, @LAX, @indirectYMode, 1, 0, 0 # 5 (+1) cycles (undocumented operation)

        @registerOperation 0xBB, @LAS, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles (undocumented operation)

        ###########################################################
        # Register transfer instructions
        ###########################################################

        @registerOperation 0xAA, @TAX, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0xA8, @TAY, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x8A, @TXA, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x98, @TYA, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x9A, @TXS, @impliedMode, 0, 0, 0 # 2 cycles
        @registerOperation 0xBA, @TSX, @impliedMode, 0, 0, 0 # 2 cycles

        ###########################################################
        # Stack push instructions
        ###########################################################

        @registerOperation 0x48, @PHA, @impliedMode, 0, 0, 0 # 3 cycles
        @registerOperation 0x08, @PHP, @impliedMode, 0, 0, 0 # 3 cycles

        ###########################################################
        # Stack pull instructions
        ###########################################################

        @registerOperation 0x68, @PLA, @impliedMode, 0, 1, 0 # 4 cycles
        @registerOperation 0x28, @PLP, @impliedMode, 0, 1, 0 # 4 cycles

        ###########################################################
        # Accumulator bitwise instructions
        ###########################################################

        @registerOperation 0x29, @AND, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0x25, @AND, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0x35, @AND, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0x2D, @AND, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0x3D, @AND, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x39, @AND, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x21, @AND, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0x31, @AND, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0x09, @ORA, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0x05, @ORA, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0x15, @ORA, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0x0D, @ORA, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0x1D, @ORA, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x19, @ORA, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x01, @ORA, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0x11, @ORA, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0x49, @EOR, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0x45, @EOR, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0x55, @EOR, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0x4D, @EOR, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0x5D, @EOR, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x59, @EOR, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x41, @EOR, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0x51, @EOR, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0x24, @BIT, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0x2C, @BIT, @absoluteMode,  0, 0, 0 # 4      cycles

        ###########################################################
        # Increment instructions
        ###########################################################

        @registerOperation 0xE6, @INC, @zeroPageMode,  0, 0, 1 # 5 cycles
        @registerOperation 0xF6, @INC, @zeroPageXMode, 0, 1, 1 # 6 cycles
        @registerOperation 0xEE, @INC, @absoluteMode,  0, 0, 1 # 6 cycles
        @registerOperation 0xFE, @INC, @absoluteXMode, 0, 1, 1 # 7 cycles

        @registerOperation 0xE8, @INX, @impliedMode,   0, 0, 0 # 2 cycles
        @registerOperation 0xC8, @INY, @impliedMode,   0, 0, 0 # 2 cycles

        ###########################################################
        # Decrement instructions
        ###########################################################

        @registerOperation 0xC6, @DEC, @zeroPageMode,  0, 0, 1 # 5 cycles
        @registerOperation 0xD6, @DEC, @zeroPageXMode, 0, 1, 1 # 6 cycles
        @registerOperation 0xCE, @DEC, @absoluteMode,  0, 0, 1 # 6 cycles
        @registerOperation 0xDE, @DEC, @absoluteXMode, 0, 1, 1 # 7 cycles

        @registerOperation 0xCA, @DEX, @impliedMode,   0, 0, 0 # 2 cycles
        @registerOperation 0x88, @DEY, @impliedMode,   0, 0, 0 # 2 cycles

        ###########################################################
        # Comparison instructions
        ###########################################################

        @registerOperation 0xC9, @CMP, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xC5, @CMP, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xD5, @CMP, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0xCD, @CMP, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0xDD, @CMP, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xD9, @CMP, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xC1, @CMP, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0xD1, @CMP, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0xE0, @CPX, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xE4, @CPX, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xEC, @CPX, @absoluteMode,  0, 0, 0 # 4      cycles

        @registerOperation 0xC0, @CPY, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xC4, @CPY, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xCC, @CPY, @absoluteMode,  0, 0, 0 # 4      cycles

        ###########################################################
        # Branching instructions
        ###########################################################

        @registerOperation 0x90, @BCC, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0xB0, @BCS, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0xD0, @BNE, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0xF0, @BEQ, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0x50, @BVC, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0x70, @BVS, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles

        @registerOperation 0x10, @BPL, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles
        @registerOperation 0x30, @BMI, @relativeMode, 0, 0, 0 # 2 (+1/+2) cycles

        ###########################################################
        # Jump / subroutine instructions
        ###########################################################

        @registerOperation 0x4C, @JMP, @absoluteMode, 0, 0, 0 # 3 cycles
        @registerOperation 0x6C, @JMP, @indirectMode, 0, 0, 0 # 5 cycles
        @registerOperation 0x20, @JSR, @absoluteMode, 0, 1, 0 # 6 cycles
        @registerOperation 0x60, @RTS, @impliedMode,  0, 1, 0 # 6 cycles

        ###########################################################
        # Interrupt control instructions
        ###########################################################

        @registerOperation 0x00, @BRK, @impliedMode, 0, 0, 0 # 7 cycles
        @registerOperation 0x40, @RTI, @impliedMode, 0, 1, 0 # 6 cycles

        ###########################################################
        # Addition / subtraction instructions
        ###########################################################

        @registerOperation 0x69, @ADC, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0x65, @ADC, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0x75, @ADC, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0x6D, @ADC, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0x7D, @ADC, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x79, @ADC, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0x61, @ADC, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0x71, @ADC, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        @registerOperation 0xE9, @SBC, @immediateMode, 0, 0, 0 # 2      cycles
        @registerOperation 0xEB, @SBC, @immediateMode, 0, 0, 0 # 2      cycles (undocumented operation)
        @registerOperation 0xE5, @SBC, @zeroPageMode,  0, 0, 0 # 3      cycles
        @registerOperation 0xF5, @SBC, @zeroPageXMode, 0, 1, 0 # 4      cycles
        @registerOperation 0xED, @SBC, @absoluteMode,  0, 0, 0 # 4      cycles
        @registerOperation 0xFD, @SBC, @absoluteXMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xF9, @SBC, @absoluteYMode, 1, 0, 0 # 4 (+1) cycles
        @registerOperation 0xE1, @SBC, @indirectXMode, 0, 1, 0 # 6      cycles
        @registerOperation 0xF1, @SBC, @indirectYMode, 1, 0, 0 # 5 (+1) cycles

        ###########################################################
        # Shifting instructions
        ###########################################################

        @registerOperation 0x0A, @ASL, @accumulatorMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x06, @ASL, @zeroPageMode,    0, 0, 1 # 5 cycles
        @registerOperation 0x16, @ASL, @zeroPageXMode,   0, 1, 1 # 6 cycles
        @registerOperation 0x0E, @ASL, @absoluteMode,    0, 0, 1 # 6 cycles
        @registerOperation 0x1E, @ASL, @absoluteXMode,   0, 1, 1 # 7 cycles

        @registerOperation 0x4A, @LSR, @accumulatorMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x46, @LSR, @zeroPageMode,    0, 0, 1 # 5 cycles
        @registerOperation 0x56, @LSR, @zeroPageXMode,   0, 1, 1 # 6 cycles
        @registerOperation 0x4E, @LSR, @absoluteMode,    0, 0, 1 # 6 cycles
        @registerOperation 0x5E, @LSR, @absoluteXMode,   0, 1, 1 # 7 cycles

        @registerOperation 0x2A, @ROL, @accumulatorMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x26, @ROL, @zeroPageMode,    0, 0, 1 # 5 cycles
        @registerOperation 0x36, @ROL, @zeroPageXMode,   0, 1, 1 # 6 cycles
        @registerOperation 0x2E, @ROL, @absoluteMode,    0, 0, 1 # 6 cycles
        @registerOperation 0x3E, @ROL, @absoluteXMode,   0, 1, 1 # 7 cycles

        @registerOperation 0x6A, @ROR, @accumulatorMode, 0, 0, 0 # 2 cycles
        @registerOperation 0x66, @ROR, @zeroPageMode,    0, 0, 1 # 5 cycles
        @registerOperation 0x76, @ROR, @zeroPageXMode,   0, 1, 1 # 6 cycles
        @registerOperation 0x6E, @ROR, @absoluteMode,    0, 0, 1 # 6 cycles
        @registerOperation 0x7E, @ROR, @absoluteXMode,   0, 1, 1 # 7 cycles

        ###################################################################
        # Hybrid instructions
        ###################################################################

        @registerOperation 0xC7, @DCP, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0xD7, @DCP, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xCF, @DCP, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xDF, @DCP, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xDB, @DCP, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xC3, @DCP, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0xD3, @DCP, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0xE7, @ISB, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0xF7, @ISB, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xEF, @ISB, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0xFF, @ISB, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xFB, @ISB, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0xE3, @ISB, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0xF3, @ISB, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x07, @SLO, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x17, @SLO, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x0F, @SLO, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x1F, @SLO, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x1B, @SLO, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x03, @SLO, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x13, @SLO, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x47, @SRE, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x57, @SRE, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x4F, @SRE, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x5F, @SRE, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x5B, @SRE, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x43, @SRE, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x53, @SRE, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x27, @RLA, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x37, @RLA, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x2F, @RLA, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x3F, @RLA, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x3B, @RLA, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x23, @RLA, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x33, @RLA, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0x8B, @XAA, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x67, @RRA, @zeroPageMode,  0, 0, 1 # 5 cycles (undocumented operation)
        @registerOperation 0x77, @RRA, @zeroPageXMode, 0, 1, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x6F, @RRA, @absoluteMode,  0, 0, 1 # 6 cycles (undocumented operation)
        @registerOperation 0x7F, @RRA, @absoluteXMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x7B, @RRA, @absoluteYMode, 0, 1, 1 # 7 cycles (undocumented operation)
        @registerOperation 0x63, @RRA, @indirectXMode, 0, 1, 1 # 8 cycles (undocumented operation)
        @registerOperation 0x73, @RRA, @indirectYMode, 0, 1, 1 # 8 cycles (undocumented operation)

        @registerOperation 0xCB, @AXS, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x0B, @ANC, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x2B, @ANC, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x4B, @ALR, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)
        @registerOperation 0x6B, @ARR, @immediateMode, 0, 0, 0 # 2 cycles (undocumented operation)

        @registerOperation 0x9B, @TAS, @absoluteYMode, 0, 1, 0 # 5 cycles (undocumented operation)

    registerOperation: (operationCode, instruction, addressingMode, pageCrossEnabled, emptyReadCycles, emptyWriteCycles) ->
        @operationsTable[operationCode] =
            instruction: instruction
            addressingMode: addressingMode
            pageCrossEnabled: pageCrossEnabled
            emptyReadCycles: emptyReadCycles
            emptyWriteCycles: emptyWriteCycles

    ###########################################################
    # Mapper connection
    ###########################################################

    connectMapper: (mapper) ->
        @mapper = mapper

module.exports = CPU
