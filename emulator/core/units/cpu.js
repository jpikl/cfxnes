import { Interrupt } from "../common/types";
import { byteAsHex } from "../utils/format";
import { logger }    from "../utils/logger";

export class CPU {

    init(cpuMemory, ppu, apu, dma) {
        this.cpuMemory = cpuMemory;
        this.ppu = ppu;
        this.apu = apu;
        this.dma = dma;
        this.initOperationsTable();
    }

    powerUp() {
        logger.info("Reseting CPU");
        this.resetRegisters();
        this.resetVariables();
        this.resetMemory();
        this.handleReset();
    }

    resetRegisters() {
        this.programCounter = 0;
        this.stackPointer = 0;
        this.accumulator = 0;
        this.registerX = 0;
        this.registerY = 0;
        this.setStatus(0);
    }

    resetVariables() {
        this.cycle = 0;
        this.emptyReadCycles = 0;
        this.emptyWriteCycles = 0;
        this.activeInterrupts = 0;
        this.halted = false;
    }

    resetMemory() {
        for (var i = 0x0000; i < 0x0800; i++) this.write(i, 0xFF);
        for (var i = 0x4000; i < 0x4010; i++) this.write(i, 0x00);
        this.write(0x0008, 0xF7);
        this.write(0x0009, 0xEF);
        this.write(0x000A, 0xDF);
        this.write(0x000F, 0xBF);
    }

    step() {
        var blocked = this.dma.isBlockingCPU() || this.apu.isBlockingCPU();
        if (this.activeInterrupts && !blocked) {
            this.resolveInterrupt();
        }
        if (this.halted || blocked) {
            this.tick();
        } else {
            this.executeOperation();
        }
    }

    resolveInterrupt() {
        if (this.activeInterrupts & Interrupt.RESET) {
            this.handleReset();
        } else if (this.activeInterrupts & Interrupt.NMI) {
            this.handleNMI();
        } else if (this.interruptDisable) {
            return;
        } else {
            this.handleIRQ();
        }
        this.tick();
        this.tick();
    }

    handleReset() {
        this.cycle = 0;
        this.write(0x4015, 0x00);
        this.write(0x4017, this.apu.frameCounterLastWrittenValue);
        this.stackPointer = (this.stackPointer - 3) & 0xFF;
        for (var i = 0; i < 3; i++) this.tick();
        this.enterInterruptHandler(0xFFFC);
        this.clearInterrupt(Interrupt.RESET);
        this.halted = false;
    }

    handleNMI() {
        this.saveStateBeforeInterrupt();
        this.enterInterruptHandler(0xFFFA);
        this.clearInterrupt(Interrupt.NMI);
    }

    handleIRQ() {
        this.saveStateBeforeInterrupt();
        this.enterInterruptHandler(0xFFFE);
    }

    saveStateBeforeInterrupt() {
        this.pushWord(this.programCounter);
        this.pushByte(this.getStatus());
    }

    enterInterruptHandler(address) {
        this.interruptDisable = 1;
        this.programCounter = this.readWord(address);
    }

    executeOperation() {
        var operation = this.readOperation();
        if (!operation) {
            logger.info("CPU halted!");
            this.halted = true;
            return;
        }

        var instruction = operation.instruction;
        var addressingMode = operation.addressingMode;

        this.pageCrossed = false;
        this.pageCrossEnabled = operation.pageCrossEnabled;
        this.emptyReadCycles = operation.emptyReadCycles;
        this.emptyWriteCycles = operation.emptyWriteCycles;

        var address = addressingMode.call(this);
        instruction.call(this, address);
    }

    readOperation() {
        return this.operationsTable[this.readNextProgramByte()];
    }

    readNextProgramByte() {
        return this.readByte(this.moveProgramCounter(1));
    }

    readNextProgramWord() {
        return this.readWord(this.moveProgramCounter(2));
    }

    moveProgramCounter(size) {
        var previousProgramCounter = this.programCounter;
        this.programCounter = (this.programCounter + size) & 0xFFFF;
        return previousProgramCounter;
    }

    read(address) {
        return this.cpuMemory.read(address);
    }

    readByte(address) {
        this.resolveReadCycles();
        return this.read(address);
    }

    readWord(address) {
        var highAddress = (address + 1) & 0xFFFF;
        var highByte = this.readByte(highAddress);
        return highByte << 8 | this.readByte(address);
    }

    readWordFromSamePage(address) {
        var highAddress = address & 0xFF00 | (address + 1) & 0x00FF;
        var highByte = this.readByte(highAddress);
        return highByte << 8 | this.readByte(address);
    }

    write(address, value) {
        this.cpuMemory.write(address, value);
    }

    writeByte(address, value) {
        this.resolveWriteCycles();
        this.write(address, value);
        return value;
    }

    writeWord(address, value) {
        this.writeByte(address, value & 0xFF);
        return this.writeByte((address + 1) & 0xFFFF, value >>> 8);
    }

    pushByte(value) {
        this.writeByte(0x100 + this.stackPointer, value);
        this.stackPointer = (this.stackPointer - 1) & 0xFF;
    }

    pushWord(value) {
        this.pushByte(value >>> 8);
        this.pushByte(value & 0xFF);
    }

    popByte() {
        this.stackPointer = (this.stackPointer + 1) & 0xFF;
        return this.readByte(0x100 + this.stackPointer);
    }

    popWord() {
        return this.popByte() | this.popByte() << 8;
    }

    resolveReadCycles() {
        this.tick();
        if (this.emptyReadCycles) {
            this.emptyReadCycles--;
            this.tick();
        }
    }

    resolveWriteCycles() {
        this.tick();
        if (this.emptyWriteCycles) {
            this.emptyWriteCycles--;
            this.tick();
        }
    }

    tick() {
        this.cycle++;
        if (!this.apu.isBlockingDMA()) {
            this.dma.tick();
        }
        for (var i = 0; i < 3; i++) {
            this.ppu.tick();
        }
        this.apu.tick();
    }

    getStatus() {
        return this.carryFlag
             | this.zeroFlag         << 1
             | this.interruptDisable << 2
             | this.decimalMode      << 3
             | 1                     << 5
             | this.overflowFlag     << 6
             | this.negativeFlag     << 7;
    }

    setStatus(value) {
        this.carryFlag        =  value        & 1;
        this.zeroFlag         = (value >>> 1) & 1;
        this.interruptDisable = (value >>> 2) & 1;
        this.decimalMode      = (value >>> 3) & 1;
        this.overflowFlag     = (value >>> 6) & 1;
        this.negativeFlag     =  value >>> 7;
    }

    activateInterrupt(type) {
        this.activeInterrupts |= type;
    }

    clearInterrupt(type) {
        this.activeInterrupts &= ~type;
    }

    impliedMode() {
        this.tick();
    }

    accumulatorMode() {
        this.tick();
    }

    immediateMode() {
        return this.moveProgramCounter(1);
    }

    zeroPageMode() {
        return this.readNextProgramByte();
    }

    zeroPageXMode() {
        var base = this.readNextProgramByte();
        return this.getIndexedAddressByte(base, this.registerX);
    }

    zeroPageYMode() {
        var base = this.readNextProgramByte();
        return this.getIndexedAddressByte(base, this.registerY);
    }

    absoluteMode() {
        return this.readNextProgramWord();
    }

    absoluteXMode() {
        var base = this.readNextProgramWord();
        return this.getIndexedAddressWord(base, this.registerX);
    }

    absoluteYMode() {
        var base = this.readNextProgramWord();
        return this.getIndexedAddressWord(base, this.registerY);
    }

    relativeMode() {
        var base = (this.programCounter + 1) & 0xFFFF;
        var offset = this.getSignedByte(this.readNextProgramByte());
        return this.getIndexedAddressWord(base, offset);
    }

    indirectMode() {
        return this.readWordFromSamePage(this.readNextProgramWord());
    }

    indirectXMode() {
        return this.readWordFromSamePage(this.zeroPageXMode());
    }

    indirectYMode() {
        var base = this.readWordFromSamePage(this.readNextProgramByte());
        return this.getIndexedAddressWord(base, this.registerY);
    }

    getIndexedAddressByte(base, offset) {
        return (base + offset) & 0xFF;
    }

    getIndexedAddressWord(base, offset) {
        this.pageCrossed = (base & 0xFF00) !== ((base + offset) & 0xFF00);
        if (this.pageCrossEnabled && this.pageCrossed) {
            this.emptyReadCycles++;
        }
        return (base + offset) & 0xFFFF;
    }

    getSignedByte(value) {
        if (value >= 0x80) {
            return value - 0x100;
        } else {
            return value;
        }
    }

    NOP() {
    }

    CLC() {
        this.carryFlag = 0;
    }

    CLI() {
        this.interruptDisable = 0;
    }

    CLD() {
        this.decimalMode = 0;
    }

    CLV() {
        this.overflowFlag = 0;
    }

    SEC() {
        this.carryFlag = 1;
    }

    SEI() {
        this.interruptDisable = 1;
    }

    SED() {
        this.decimalMode = 1;
    }

    STA(address) {
        this.writeByte(address, this.accumulator);
    }

    STX(address) {
        this.writeByte(address, this.registerX);
    }

    SAX(address) {
        this.writeByte(address, this.accumulator & this.registerX);
    }

    STY(address) {
        this.writeByte(address, this.registerY);
    }

    SHA(address) {
        this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
    }

    SHX(address) {
        this.storeHighAddressIntoMemory(address, this.registerX);
    }

    SHY(address) {
        this.storeHighAddressIntoMemory(address, this.registerY);
    }

    LDA(address) {
        this.storeValueIntoAccumulator(this.readByte(address));
    }

    LDX(address) {
        this.storeValueIntoRegisterX(this.readByte(address));
    }

    LDY(address) {
        this.storeValueIntoRegisterY(this.readByte(address));
    }

    LAX(address) {
        var value = this.readByte(address);
        this.storeValueIntoAccumulator(value);
        this.storeValueIntoRegisterX(value);
    }

    LAS(address) {
        this.stackPointer &= this.readByte(address);
        this.storeValueIntoAccumulator(this.stackPointer);
        this.storeValueIntoRegisterX(this.stackPointer);
    }

    TAX() {
        this.storeValueIntoRegisterX(this.accumulator);
    }

    TAY() {
        this.storeValueIntoRegisterY(this.accumulator);
    }

    TXA() {
        this.storeValueIntoAccumulator(this.registerX);
    }

    TYA() {
        this.storeValueIntoAccumulator(this.registerY);
    }

    TSX() {
        this.storeValueIntoRegisterX(this.stackPointer);
    }

    TXS() {
        this.stackPointer = this.registerX;
    }

    PHA() {
        this.pushByte(this.accumulator);
    }

    PHP() {
        this.pushByte(this.getStatus() | 0x10);
    }

    PLA() {
        this.storeValueIntoAccumulator(this.popByte());
    }

    PLP() {
        this.setStatus(this.popByte());
    }

    AND(address) {
        var value = this.readByte(address);
        return this.storeValueIntoAccumulator(this.accumulator & value);
    }

    ORA(address) {
        var value = this.readByte(address);
        this.storeValueIntoAccumulator(this.accumulator | value);
    }

    EOR(address) {
        var value = this.readByte(address);
        this.storeValueIntoAccumulator(this.accumulator ^ value);
    }

    BIT(address) {
        var value = this.readByte(address);
        this.zeroFlag = (this.accumulator & value) === 0;
        this.overflowFlag = (value >>> 6) & 1;
        this.negativeFlag = value >>> 7;
    }

    INC(address) {
        var value = this.readByte(address)
        return this.storeValueIntoMemory(address, (value + 1) & 0xFF);
    }

    INX() {
        this.storeValueIntoRegisterX((this.registerX + 1) & 0xFF);
    }

    INY() {
        this.storeValueIntoRegisterY((this.registerY + 1) & 0xFF);
    }

    DEC(address) {
        var value = this.readByte(address);
        return this.storeValueIntoMemory(address, (value - 1) & 0xFF);
    }

    DEX() {
        this.storeValueIntoRegisterX((this.registerX - 1) & 0xFF);
    }

    DEY() {
        this.storeValueIntoRegisterY((this.registerY - 1) & 0xFF);
    }

    CMP(address) {
        this.compareRegisterAndMemory(this.accumulator, address);
    }

    CPX(address) {
        this.compareRegisterAndMemory(this.registerX, address);
    }

    CPY(address) {
        this.compareRegisterAndMemory(this.registerY, address);
    }

    BCC(address) {
        this.branchIf(!this.carryFlag, address);
    }

    BCS(address) {
        this.branchIf(this.carryFlag, address);
    }

    BNE(address) {
        this.branchIf(!this.zeroFlag, address);
    }

    BEQ(address) {
        this.branchIf(this.zeroFlag, address);
    }

    BVC(address) {
        this.branchIf(!this.overflowFlag, address);
    }

    BVS(address) {
        this.branchIf(this.overflowFlag, address);
    }

    BPL(address) {
        this.branchIf(!this.negativeFlag, address);
    }

    BMI(address) {
        this.branchIf(this.negativeFlag, address);
    }

    JMP(address) {
        this.programCounter = address;
    }

    JSR(address) {
        this.pushWord((this.programCounter - 1) & 0xFFFF);
        this.programCounter = address;
    }

    RTS() {
        this.programCounter = (this.popWord() + 1) & 0xFFFF;
        this.tick();
    }

    BRK() {
        this.moveProgramCounter(1);
        this.pushWord(this.programCounter);
        this.pushByte(this.getStatus() | 0x10);
        this.interruptDisable = 1;
        this.programCounter = this.readWord(0xFFFE);
    }

    RTI() {
        this.setStatus(this.popByte());
        this.programCounter = this.popWord();
    }

    ADC(address) {
        this.addValueToAccumulator(this.readByte(address));
    }

    SBC(address) {
        this.addValueToAccumulator((this.readByte(address)) ^ 0xFF);
    }

    ASL(address) {
        return this.rotateAccumulatorOrMemory(address, this.rotateLeft, false);
    }

    LSR(address) {
        return this.rotateAccumulatorOrMemory(address, this.rotateRight, false);
    }

    ROL(address) {
        return this.rotateAccumulatorOrMemory(address, this.rotateLeft, true);
    }

    ROR(address) {
        return this.rotateAccumulatorOrMemory(address, this.rotateRight, true);
    }

    DCP(address) {
        this.compareRegisterAndOperand(this.accumulator, this.DEC(address));
    }

    ISB(address) {
        this.addValueToAccumulator((this.INC(address)) ^ 0xFF);
    }

    SLO(address) {
        this.storeValueIntoAccumulator(this.accumulator | this.ASL(address));
    }

    SRE(address) {
        this.storeValueIntoAccumulator(this.accumulator ^ this.LSR(address));
    }

    RLA(address) {
        this.storeValueIntoAccumulator(this.accumulator & this.ROL(address));
    }

    XAA(address) {
        this.storeValueIntoAccumulator(this.registerX & this.AND(address));
    }

    RRA(address) {
        this.addValueToAccumulator(this.ROR(address));
    }

    AXS(address) {
        this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
    }

    ANC(address) {
        this.rotateLeft(this.AND(address), false);
    }

    ALR(address) {
        this.AND(address);
        this.LSR();
    }

    ARR(address) {
        this.AND(address);
        this.ROR();
        this.carryFlag = (this.accumulator >>> 6) & 1;
        this.overflowFlag = ((this.accumulator >>> 5) & 1) ^ this.carryFlag;
    }

    TAS(address) {
        this.stackPointer = this.accumulator & this.registerX;
        this.SHA(address);
    }

    storeValueIntoAccumulator(value) {
        this.updateZeroAndNegativeFlag(value);
        return this.accumulator = value;
    }

    storeValueIntoRegisterX(value) {
        this.updateZeroAndNegativeFlag(value);
        this.registerX = value;
    }

    storeValueIntoRegisterY(value) {
        this.updateZeroAndNegativeFlag(value);
        this.registerY = value;
    }

    storeValueIntoMemory(address, value) {
        this.updateZeroAndNegativeFlag(value);
        return this.writeByte(address, value);
    }

    storeHighAddressIntoMemory(address, register) {
        if (this.pageCrossed) {
            this.writeByte(address, this.read(address));
        } else {
            this.writeByte(address, register & ((address >>> 8) + 1));
        }
    }

    addValueToAccumulator(operand) {
        var result = this.accumulator + operand + this.carryFlag;
        this.carryFlag = (result >>> 8) & 1;
        this.overflowFlag = (((this.accumulator ^ result) & (operand ^ result)) >>> 7) & 1;
        return this.storeValueIntoAccumulator(result & 0xFF);
    }

    compareRegisterAndMemory(register, address) {
        return this.compareRegisterAndOperand(register, this.readByte(address));
    }

    compareRegisterAndOperand(register, operand) {
        var result = register - operand;
        this.carryFlag = result >= 0;
        this.updateZeroAndNegativeFlag(result);
        return result & 0xFF;
    }

    branchIf(condition, address) {
        if (condition) {
            this.programCounter = address;
            this.tick();
            if (this.pageCrossed) {
                this.tick();
            }
        }
    }

    rotateAccumulatorOrMemory(address, rotation, transferCarry) {
        if (address != null) {
            var result = rotation.call(this, this.readByte(address), transferCarry);
            return this.storeValueIntoMemory(address, result);
        } else {
            var result = rotation.call(this, this.accumulator, transferCarry);
            return this.storeValueIntoAccumulator(result);
        }
    }

    rotateLeft(value, transferCarry) {
        var carry = transferCarry & this.carryFlag;
        this.carryFlag = value >>> 7;
        return (value << 1 | carry) & 0xFF;
    }

    rotateRight(value, transferCarry) {
        var carry = (transferCarry & this.carryFlag) << 7;
        this.carryFlag = value & 1;
        return value >>> 1 | carry;
    }

    updateZeroAndNegativeFlag(value) {
        this.zeroFlag = (value & 0xFF) === 0;
        this.negativeFlag = (value >>> 7) & 1;
    }

    initOperationsTable() {
        this.operationsTable = [];
        this.registerOperation(0x1A, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x3A, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x5A, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x7A, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xDA, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xEA, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xFA, this.NOP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x80, this.NOP, this.immediateMode, 0, 1, 0);
        this.registerOperation(0x82, this.NOP, this.immediateMode, 0, 1, 0);
        this.registerOperation(0x89, this.NOP, this.immediateMode, 0, 1, 0);
        this.registerOperation(0xC2, this.NOP, this.immediateMode, 0, 1, 0);
        this.registerOperation(0xE2, this.NOP, this.immediateMode, 0, 1, 0);
        this.registerOperation(0x04, this.NOP, this.zeroPageMode, 0, 1, 0);
        this.registerOperation(0x44, this.NOP, this.zeroPageMode, 0, 1, 0);
        this.registerOperation(0x64, this.NOP, this.zeroPageMode, 0, 1, 0);
        this.registerOperation(0x14, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0x34, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0x54, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0x74, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0xD4, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0xF4, this.NOP, this.zeroPageXMode, 0, 2, 0);
        this.registerOperation(0x0C, this.NOP, this.absoluteMode, 0, 1, 0);
        this.registerOperation(0x1C, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0x3C, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0x5C, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0x7C, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0xDC, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0xFC, this.NOP, this.absoluteXMode, 1, 1, 0);
        this.registerOperation(0x18, this.CLC, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x58, this.CLI, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xD8, this.CLD, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xB8, this.CLV, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x38, this.SEC, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x78, this.SEI, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xF8, this.SED, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x85, this.STA, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x95, this.STA, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x8D, this.STA, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x9D, this.STA, this.absoluteXMode, 0, 1, 0);
        this.registerOperation(0x99, this.STA, this.absoluteYMode, 0, 1, 0);
        this.registerOperation(0x81, this.STA, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x91, this.STA, this.indirectYMode, 0, 1, 0);
        this.registerOperation(0x86, this.STX, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x96, this.STX, this.zeroPageYMode, 0, 1, 0);
        this.registerOperation(0x8E, this.STX, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x87, this.SAX, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x97, this.SAX, this.zeroPageYMode, 0, 1, 0);
        this.registerOperation(0x8F, this.SAX, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x83, this.SAX, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x84, this.STY, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x94, this.STY, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x8C, this.STY, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x93, this.SHA, this.indirectYMode, 0, 1, 0);
        this.registerOperation(0x9F, this.SHA, this.absoluteYMode, 0, 1, 0);
        this.registerOperation(0x9E, this.SHX, this.absoluteYMode, 0, 1, 0);
        this.registerOperation(0x9C, this.SHY, this.absoluteXMode, 0, 1, 0);
        this.registerOperation(0xA9, this.LDA, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xA5, this.LDA, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xB5, this.LDA, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0xAD, this.LDA, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xBD, this.LDA, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0xB9, this.LDA, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xA1, this.LDA, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0xB1, this.LDA, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0xA2, this.LDX, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xA6, this.LDX, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xB6, this.LDX, this.zeroPageYMode, 0, 1, 0);
        this.registerOperation(0xAE, this.LDX, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xBE, this.LDX, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xA0, this.LDY, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xA4, this.LDY, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xB4, this.LDY, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0xAC, this.LDY, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xBC, this.LDY, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0xAB, this.LAX, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xA7, this.LAX, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xB7, this.LAX, this.zeroPageYMode, 0, 1, 0);
        this.registerOperation(0xAF, this.LAX, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xBF, this.LAX, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xA3, this.LAX, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0xB3, this.LAX, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0xBB, this.LAS, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xAA, this.TAX, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xA8, this.TAY, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x8A, this.TXA, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x98, this.TYA, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x9A, this.TXS, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xBA, this.TSX, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x48, this.PHA, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x08, this.PHP, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x68, this.PLA, this.impliedMode, 0, 1, 0);
        this.registerOperation(0x28, this.PLP, this.impliedMode, 0, 1, 0);
        this.registerOperation(0x29, this.AND, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x25, this.AND, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x35, this.AND, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x2D, this.AND, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x3D, this.AND, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0x39, this.AND, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0x21, this.AND, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x31, this.AND, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0x09, this.ORA, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x05, this.ORA, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x15, this.ORA, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x0D, this.ORA, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x1D, this.ORA, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0x19, this.ORA, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0x01, this.ORA, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x11, this.ORA, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0x49, this.EOR, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x45, this.EOR, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x55, this.EOR, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x4D, this.EOR, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x5D, this.EOR, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0x59, this.EOR, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0x41, this.EOR, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x51, this.EOR, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0x24, this.BIT, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x2C, this.BIT, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xE6, this.INC, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0xF6, this.INC, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0xEE, this.INC, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0xFE, this.INC, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0xE8, this.INX, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xC8, this.INY, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xC6, this.DEC, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0xD6, this.DEC, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0xCE, this.DEC, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0xDE, this.DEC, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0xCA, this.DEX, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x88, this.DEY, this.impliedMode, 0, 0, 0);
        this.registerOperation(0xC9, this.CMP, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xC5, this.CMP, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xD5, this.CMP, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0xCD, this.CMP, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xDD, this.CMP, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0xD9, this.CMP, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xC1, this.CMP, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0xD1, this.CMP, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0xE0, this.CPX, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xE4, this.CPX, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xEC, this.CPX, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xC0, this.CPY, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xC4, this.CPY, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xCC, this.CPY, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x90, this.BCC, this.relativeMode, 0, 0, 0);
        this.registerOperation(0xB0, this.BCS, this.relativeMode, 0, 0, 0);
        this.registerOperation(0xD0, this.BNE, this.relativeMode, 0, 0, 0);
        this.registerOperation(0xF0, this.BEQ, this.relativeMode, 0, 0, 0);
        this.registerOperation(0x50, this.BVC, this.relativeMode, 0, 0, 0);
        this.registerOperation(0x70, this.BVS, this.relativeMode, 0, 0, 0);
        this.registerOperation(0x10, this.BPL, this.relativeMode, 0, 0, 0);
        this.registerOperation(0x30, this.BMI, this.relativeMode, 0, 0, 0);
        this.registerOperation(0x4C, this.JMP, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x6C, this.JMP, this.indirectMode, 0, 0, 0);
        this.registerOperation(0x20, this.JSR, this.absoluteMode, 0, 1, 0);
        this.registerOperation(0x60, this.RTS, this.impliedMode, 0, 1, 0);
        this.registerOperation(0x00, this.BRK, this.impliedMode, 0, 0, 0);
        this.registerOperation(0x40, this.RTI, this.impliedMode, 0, 1, 0);
        this.registerOperation(0x69, this.ADC, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x65, this.ADC, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0x75, this.ADC, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0x6D, this.ADC, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0x7D, this.ADC, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0x79, this.ADC, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0x61, this.ADC, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0x71, this.ADC, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0xE9, this.SBC, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xEB, this.SBC, this.immediateMode, 0, 0, 0);
        this.registerOperation(0xE5, this.SBC, this.zeroPageMode, 0, 0, 0);
        this.registerOperation(0xF5, this.SBC, this.zeroPageXMode, 0, 1, 0);
        this.registerOperation(0xED, this.SBC, this.absoluteMode, 0, 0, 0);
        this.registerOperation(0xFD, this.SBC, this.absoluteXMode, 1, 0, 0);
        this.registerOperation(0xF9, this.SBC, this.absoluteYMode, 1, 0, 0);
        this.registerOperation(0xE1, this.SBC, this.indirectXMode, 0, 1, 0);
        this.registerOperation(0xF1, this.SBC, this.indirectYMode, 1, 0, 0);
        this.registerOperation(0x0A, this.ASL, this.accumulatorMode, 0, 0, 0);
        this.registerOperation(0x06, this.ASL, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x16, this.ASL, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x0E, this.ASL, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x1E, this.ASL, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x4A, this.LSR, this.accumulatorMode, 0, 0, 0);
        this.registerOperation(0x46, this.LSR, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x56, this.LSR, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x4E, this.LSR, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x5E, this.LSR, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x2A, this.ROL, this.accumulatorMode, 0, 0, 0);
        this.registerOperation(0x26, this.ROL, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x36, this.ROL, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x2E, this.ROL, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x3E, this.ROL, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x6A, this.ROR, this.accumulatorMode, 0, 0, 0);
        this.registerOperation(0x66, this.ROR, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x76, this.ROR, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x6E, this.ROR, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x7E, this.ROR, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0xC7, this.DCP, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0xD7, this.DCP, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0xCF, this.DCP, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0xDF, this.DCP, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0xDB, this.DCP, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0xC3, this.DCP, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0xD3, this.DCP, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0xE7, this.ISB, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0xF7, this.ISB, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0xEF, this.ISB, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0xFF, this.ISB, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0xFB, this.ISB, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0xE3, this.ISB, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0xF3, this.ISB, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0x07, this.SLO, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x17, this.SLO, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x0F, this.SLO, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x1F, this.SLO, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x1B, this.SLO, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0x03, this.SLO, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0x13, this.SLO, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0x47, this.SRE, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x57, this.SRE, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x4F, this.SRE, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x5F, this.SRE, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x5B, this.SRE, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0x43, this.SRE, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0x53, this.SRE, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0x27, this.RLA, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x37, this.RLA, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x2F, this.RLA, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x3F, this.RLA, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x3B, this.RLA, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0x23, this.RLA, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0x33, this.RLA, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0x8B, this.XAA, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x67, this.RRA, this.zeroPageMode, 0, 0, 1);
        this.registerOperation(0x77, this.RRA, this.zeroPageXMode, 0, 1, 1);
        this.registerOperation(0x6F, this.RRA, this.absoluteMode, 0, 0, 1);
        this.registerOperation(0x7F, this.RRA, this.absoluteXMode, 0, 1, 1);
        this.registerOperation(0x7B, this.RRA, this.absoluteYMode, 0, 1, 1);
        this.registerOperation(0x63, this.RRA, this.indirectXMode, 0, 1, 1);
        this.registerOperation(0x73, this.RRA, this.indirectYMode, 0, 1, 1);
        this.registerOperation(0xCB, this.AXS, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x0B, this.ANC, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x2B, this.ANC, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x4B, this.ALR, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x6B, this.ARR, this.immediateMode, 0, 0, 0);
        this.registerOperation(0x9B, this.TAS, this.absoluteYMode, 0, 1, 0);
    }

    registerOperation(operationCode, instruction, addressingMode, pageCrossEnabled, emptyReadCycles, emptyWriteCycles) {
        this.operationsTable[operationCode] = {
            instruction: instruction,
            addressingMode: addressingMode,
            pageCrossEnabled: pageCrossEnabled,
            emptyReadCycles: emptyReadCycles,
            emptyWriteCycles: emptyWriteCycles
        }
    }

    connectMapper(mapper) {
        this.mapper = mapper;
    }

}

CPU["dependencies"] = [ "cpuMemory", "ppu", "apu", "dma" ];
