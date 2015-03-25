import { Interrupt } from "../common/types";
import { byteAsHex } from "../utils/format";
import { logger }    from "../utils/logger";

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

export function CPU() {
  this.rotateRight = bind(this.rotateRight, this);
  this.rotateLeft = bind(this.rotateLeft, this);
}

CPU["dependencies"] = [ "cpuMemory", "ppu", "apu", "dma" ];

CPU.prototype.init = function(cpuMemory, ppu, apu, dma) {
  this.cpuMemory = cpuMemory;
  this.ppu = ppu;
  this.apu = apu;
  this.dma = dma;
  return this.initOperationsTable();
};

CPU.prototype.powerUp = function() {
  logger.info("Reseting CPU");
  this.resetRegisters();
  this.resetVariables();
  this.resetMemory();
  return this.handleReset();
};

CPU.prototype.resetRegisters = function() {
  this.programCounter = 0;
  this.stackPointer = 0;
  this.accumulator = 0;
  this.registerX = 0;
  this.registerY = 0;
  return this.setStatus(0);
};

CPU.prototype.resetVariables = function() {
  this.cycle = 0;
  this.emptyReadCycles = 0;
  this.emptyWriteCycles = 0;
  this.activeInterrupts = 0;
  return this.halted = false;
};

CPU.prototype.resetMemory = function() {
  var address, i, j, results;
  for (address = i = 0; i < 2048; address = ++i) {
    this.write(address, 0xFF);
  }
  this.write(0x0008, 0xF7);
  this.write(0x0009, 0xEF);
  this.write(0x000A, 0xDF);
  this.write(0x000F, 0xBF);
  results = [];
  for (address = j = 0x4000; j < 16400; address = ++j) {
    results.push(this.write(address, 0x00));
  }
  return results;
};

CPU.prototype.step = function() {
  var blocked;
  blocked = this.dma.isBlockingCPU() || this.apu.isBlockingCPU();
  if (this.activeInterrupts && !blocked) {
    this.resolveInterrupt();
  }
  if (this.halted || blocked) {
    return this.tick();
  } else {
    return this.executeOperation();
  }
};

CPU.prototype.resolveInterrupt = function() {
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
  return this.tick();
};

CPU.prototype.handleReset = function() {
  var i;
  this.cycle = 0;
  this.write(0x4015, 0x00);
  this.write(0x4017, this.apu.frameCounterLastWrittenValue);
  this.stackPointer = (this.stackPointer - 3) & 0xFF;
  for (i = 1; i <= 3; i++) {
    this.tick();
  }
  this.enterInterruptHandler(0xFFFC);
  this.clearInterrupt(Interrupt.RESET);
  return this.halted = false;
};

CPU.prototype.handleNMI = function() {
  this.saveStateBeforeInterrupt();
  this.enterInterruptHandler(0xFFFA);
  return this.clearInterrupt(Interrupt.NMI);
};

CPU.prototype.handleIRQ = function() {
  this.saveStateBeforeInterrupt();
  return this.enterInterruptHandler(0xFFFE);
};

CPU.prototype.saveStateBeforeInterrupt = function() {
  this.pushWord(this.programCounter);
  return this.pushByte(this.getStatus());
};

CPU.prototype.enterInterruptHandler = function(address) {
  this.interruptDisable = 1;
  return this.programCounter = this.readWord(address);
};

CPU.prototype.executeOperation = function() {
  var address, addressingMode, instruction, operation;
  operation = this.readOperation();
  if (!operation) {
    logger.info("CPU halted!");
    this.halted = true;
    return;
  }
  instruction = operation.instruction;
  addressingMode = operation.addressingMode;
  this.pageCrossed = false;
  this.pageCrossEnabled = operation.pageCrossEnabled;
  this.emptyReadCycles = operation.emptyReadCycles;
  this.emptyWriteCycles = operation.emptyWriteCycles;
  address = addressingMode.call(this);
  return instruction.call(this, address);
};

CPU.prototype.readOperation = function() {
  return this.operationsTable[this.readNextProgramByte()];
};

CPU.prototype.readNextProgramByte = function() {
  return this.readByte(this.moveProgramCounter(1));
};

CPU.prototype.readNextProgramWord = function() {
  return this.readWord(this.moveProgramCounter(2));
};

CPU.prototype.moveProgramCounter = function(size) {
  var previousValue;
  previousValue = this.programCounter;
  this.programCounter = (this.programCounter + size) & 0xFFFF;
  return previousValue;
};

CPU.prototype.read = function(address) {
  return this.cpuMemory.read(address);
};

CPU.prototype.readByte = function(address) {
  this.resolveReadCycles();
  return this.read(address);
};

CPU.prototype.readWord = function(address) {
  var highByte;
  highByte = this.readByte((address + 1) & 0xFFFF);
  return highByte << 8 | this.readByte(address);
};

CPU.prototype.readWordFromSamePage = function(address) {
  var highByte;
  highByte = this.readByte(address & 0xFF00 | (address + 1) & 0x00FF);
  return highByte << 8 | this.readByte(address);
};

CPU.prototype.write = function(address, value) {
  this.cpuMemory.write(address, value);
  return value;
};

CPU.prototype.writeByte = function(address, value) {
  this.resolveWriteCycles();
  return this.write(address, value);
};

CPU.prototype.writeWord = function(address, value) {
  this.writeByte(address, value & 0xFF);
  return this.writeByte((address + 1) & 0xFFFF, value >>> 8);
};

CPU.prototype.pushByte = function(value) {
  this.writeByte(0x100 + this.stackPointer, value);
  return this.stackPointer = (this.stackPointer - 1) & 0xFF;
};

CPU.prototype.pushWord = function(value) {
  this.pushByte(value >>> 8);
  return this.pushByte(value & 0xFF);
};

CPU.prototype.popByte = function() {
  this.stackPointer = (this.stackPointer + 1) & 0xFF;
  return this.readByte(0x100 + this.stackPointer);
};

CPU.prototype.popWord = function() {
  return this.popByte() | this.popByte() << 8;
};

CPU.prototype.resolveReadCycles = function() {
  this.tick();
  if (this.emptyReadCycles) {
    this.emptyReadCycles--;
    return this.tick();
  }
};

CPU.prototype.resolveWriteCycles = function() {
  this.tick();
  if (this.emptyWriteCycles) {
    this.emptyWriteCycles--;
    return this.tick();
  }
};

CPU.prototype.tick = function() {
  var i;
  this.cycle++;
  if (!this.apu.isBlockingDMA()) {
    this.dma.tick();
  }
  for (i = 1; i <= 3; i++) {
    this.ppu.tick();
  }
  this.apu.tick();
  return void 0;
};

CPU.prototype.getStatus = function() {
  return this.carryFlag | this.zeroFlag << 1 | this.interruptDisable << 2 | this.decimalMode << 3 | 1 << 5 | this.overflowFlag << 6 | this.negativeFlag << 7;
};

CPU.prototype.setStatus = function(value) {
  this.carryFlag = value & 1;
  this.zeroFlag = (value >>> 1) & 1;
  this.interruptDisable = (value >>> 2) & 1;
  this.decimalMode = (value >>> 3) & 1;
  this.overflowFlag = (value >>> 6) & 1;
  return this.negativeFlag = value >>> 7;
};

CPU.prototype.activateInterrupt = function(type) {
  return this.activeInterrupts |= type;
};

CPU.prototype.clearInterrupt = function(type) {
  return this.activeInterrupts &= ~type;
};

CPU.prototype.impliedMode = function() {
  return this.tick();
};

CPU.prototype.accumulatorMode = function() {
  return this.tick();
};

CPU.prototype.immediateMode = function() {
  return this.moveProgramCounter(1);
};

CPU.prototype.zeroPageMode = function() {
  return this.readNextProgramByte();
};

CPU.prototype.zeroPageXMode = function() {
  return this.getIndexedAddressByte(this.readNextProgramByte(), this.registerX);
};

CPU.prototype.zeroPageYMode = function() {
  return this.getIndexedAddressByte(this.readNextProgramByte(), this.registerY);
};

CPU.prototype.absoluteMode = function() {
  return this.readNextProgramWord();
};

CPU.prototype.absoluteXMode = function() {
  return this.getIndexedAddressWord(this.readNextProgramWord(), this.registerX);
};

CPU.prototype.absoluteYMode = function() {
  return this.getIndexedAddressWord(this.readNextProgramWord(), this.registerY);
};

CPU.prototype.relativeMode = function() {
  var base, offset;
  base = (this.programCounter + 1) & 0xFFFF;
  offset = this.getSignedByte(this.readNextProgramByte());
  return this.getIndexedAddressWord(base, offset);
};

CPU.prototype.indirectMode = function() {
  return this.readWordFromSamePage(this.readNextProgramWord());
};

CPU.prototype.indirectXMode = function() {
  return this.readWordFromSamePage(this.zeroPageXMode());
};

CPU.prototype.indirectYMode = function() {
  var base;
  base = this.readWordFromSamePage(this.readNextProgramByte());
  return this.getIndexedAddressWord(base, this.registerY);
};

CPU.prototype.getIndexedAddressByte = function(base, offset) {
  return (base + offset) & 0xFF;
};

CPU.prototype.getIndexedAddressWord = function(base, offset) {
  this.pageCrossed = (base & 0xFF00) !== ((base + offset) & 0xFF00);
  if (this.pageCrossEnabled && this.pageCrossed) {
    this.emptyReadCycles++;
  }
  return (base + offset) & 0xFFFF;
};

CPU.prototype.getSignedByte = function(value) {
  if (value >= 0x80) {
    return value - 0x100;
  } else {
    return value;
  }
};

CPU.prototype.NOP = function() {};

CPU.prototype.CLC = function() {
  return this.carryFlag = 0;
};

CPU.prototype.CLI = function() {
  return this.interruptDisable = 0;
};

CPU.prototype.CLD = function() {
  return this.decimalMode = 0;
};

CPU.prototype.CLV = function() {
  return this.overflowFlag = 0;
};

CPU.prototype.SEC = function() {
  return this.carryFlag = 1;
};

CPU.prototype.SEI = function() {
  return this.interruptDisable = 1;
};

CPU.prototype.SED = function() {
  return this.decimalMode = 1;
};

CPU.prototype.STA = function(address) {
  return this.writeByte(address, this.accumulator);
};

CPU.prototype.STX = function(address) {
  return this.writeByte(address, this.registerX);
};

CPU.prototype.SAX = function(address) {
  return this.writeByte(address, this.accumulator & this.registerX);
};

CPU.prototype.STY = function(address) {
  return this.writeByte(address, this.registerY);
};

CPU.prototype.SHA = function(address) {
  return this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
};

CPU.prototype.SHX = function(address) {
  return this.storeHighAddressIntoMemory(address, this.registerX);
};

CPU.prototype.SHY = function(address) {
  return this.storeHighAddressIntoMemory(address, this.registerY);
};

CPU.prototype.LDA = function(address) {
  return this.storeValueIntoAccumulator(this.readByte(address));
};

CPU.prototype.LDX = function(address) {
  return this.storeValueIntoRegisterX(this.readByte(address));
};

CPU.prototype.LDY = function(address) {
  return this.storeValueIntoRegisterY(this.readByte(address));
};

CPU.prototype.LAX = function(address) {
  var value;
  value = this.readByte(address);
  this.storeValueIntoAccumulator(value);
  return this.storeValueIntoRegisterX(value);
};

CPU.prototype.LAS = function(address) {
  this.stackPointer &= this.readByte(address);
  this.storeValueIntoAccumulator(this.stackPointer);
  return this.storeValueIntoRegisterX(this.stackPointer);
};

CPU.prototype.TAX = function() {
  return this.storeValueIntoRegisterX(this.accumulator);
};

CPU.prototype.TAY = function() {
  return this.storeValueIntoRegisterY(this.accumulator);
};

CPU.prototype.TXA = function() {
  return this.storeValueIntoAccumulator(this.registerX);
};

CPU.prototype.TYA = function() {
  return this.storeValueIntoAccumulator(this.registerY);
};

CPU.prototype.TSX = function() {
  return this.storeValueIntoRegisterX(this.stackPointer);
};

CPU.prototype.TXS = function() {
  return this.stackPointer = this.registerX;
};

CPU.prototype.PHA = function() {
  return this.pushByte(this.accumulator);
};

CPU.prototype.PHP = function() {
  return this.pushByte(this.getStatus() | 0x10);
};

CPU.prototype.PLA = function() {
  return this.storeValueIntoAccumulator(this.popByte());
};

CPU.prototype.PLP = function() {
  return this.setStatus(this.popByte());
};

CPU.prototype.AND = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator & this.readByte(address));
};

CPU.prototype.ORA = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator | this.readByte(address));
};

CPU.prototype.EOR = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator ^ this.readByte(address));
};

CPU.prototype.BIT = function(address) {
  var value;
  value = this.readByte(address);
  this.zeroFlag = (this.accumulator & value) === 0;
  this.overflowFlag = (value >>> 6) & 1;
  return this.negativeFlag = (value >>> 7) & 1;
};

CPU.prototype.INC = function(address) {
  return this.storeValueIntoMemory(address, ((this.readByte(address)) + 1) & 0xFF);
};

CPU.prototype.INX = function() {
  return this.storeValueIntoRegisterX((this.registerX + 1) & 0xFF);
};

CPU.prototype.INY = function() {
  return this.storeValueIntoRegisterY((this.registerY + 1) & 0xFF);
};

CPU.prototype.DEC = function(address) {
  return this.storeValueIntoMemory(address, ((this.readByte(address)) - 1) & 0xFF);
};

CPU.prototype.DEX = function() {
  return this.storeValueIntoRegisterX((this.registerX - 1) & 0xFF);
};

CPU.prototype.DEY = function() {
  return this.storeValueIntoRegisterY((this.registerY - 1) & 0xFF);
};

CPU.prototype.CMP = function(address) {
  return this.compareRegisterAndMemory(this.accumulator, address);
};

CPU.prototype.CPX = function(address) {
  return this.compareRegisterAndMemory(this.registerX, address);
};

CPU.prototype.CPY = function(address) {
  return this.compareRegisterAndMemory(this.registerY, address);
};

CPU.prototype.BCC = function(address) {
  return this.branchIf(!this.carryFlag, address);
};

CPU.prototype.BCS = function(address) {
  return this.branchIf(this.carryFlag, address);
};

CPU.prototype.BNE = function(address) {
  return this.branchIf(!this.zeroFlag, address);
};

CPU.prototype.BEQ = function(address) {
  return this.branchIf(this.zeroFlag, address);
};

CPU.prototype.BVC = function(address) {
  return this.branchIf(!this.overflowFlag, address);
};

CPU.prototype.BVS = function(address) {
  return this.branchIf(this.overflowFlag, address);
};

CPU.prototype.BPL = function(address) {
  return this.branchIf(!this.negativeFlag, address);
};

CPU.prototype.BMI = function(address) {
  return this.branchIf(this.negativeFlag, address);
};

CPU.prototype.JMP = function(address) {
  return this.programCounter = address;
};

CPU.prototype.JSR = function(address) {
  this.pushWord((this.programCounter - 1) & 0xFFFF);
  return this.programCounter = address;
};

CPU.prototype.RTS = function() {
  this.programCounter = (this.popWord() + 1) & 0xFFFF;
  return this.tick();
};

CPU.prototype.BRK = function() {
  this.moveProgramCounter(1);
  this.pushWord(this.programCounter);
  this.pushByte(this.getStatus() | 0x10);
  this.interruptDisable = 1;
  return this.programCounter = this.readWord(0xFFFE);
};

CPU.prototype.RTI = function() {
  this.setStatus(this.popByte());
  return this.programCounter = this.popWord();
};

CPU.prototype.ADC = function(address) {
  return this.addValueToAccumulator(this.readByte(address));
};

CPU.prototype.SBC = function(address) {
  return this.addValueToAccumulator((this.readByte(address)) ^ 0xFF);
};

CPU.prototype.ASL = function(address) {
  return this.rotateAccumulatorOrMemory(address, this.rotateLeft, false);
};

CPU.prototype.LSR = function(address) {
  return this.rotateAccumulatorOrMemory(address, this.rotateRight, false);
};

CPU.prototype.ROL = function(address) {
  return this.rotateAccumulatorOrMemory(address, this.rotateLeft, true);
};

CPU.prototype.ROR = function(address) {
  return this.rotateAccumulatorOrMemory(address, this.rotateRight, true);
};

CPU.prototype.DCP = function(address) {
  return this.compareRegisterAndOperand(this.accumulator, this.DEC(address));
};

CPU.prototype.ISB = function(address) {
  return this.addValueToAccumulator((this.INC(address)) ^ 0xFF);
};

CPU.prototype.SLO = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator | this.ASL(address));
};

CPU.prototype.SRE = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator ^ this.LSR(address));
};

CPU.prototype.RLA = function(address) {
  return this.storeValueIntoAccumulator(this.accumulator & this.ROL(address));
};

CPU.prototype.XAA = function(address) {
  return this.storeValueIntoAccumulator(this.registerX & this.AND(address));
};

CPU.prototype.RRA = function(address) {
  return this.addValueToAccumulator(this.ROR(address));
};

CPU.prototype.AXS = function(address) {
  return this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
};

CPU.prototype.ANC = function(address) {
  return this.rotateLeft(this.AND(address), false);
};

CPU.prototype.ALR = function(address) {
  this.AND(address);
  return this.LSR();
};

CPU.prototype.ARR = function(address) {
  this.AND(address);
  this.ROR();
  this.carryFlag = (this.accumulator >>> 6) & 1;
  return this.overflowFlag = ((this.accumulator >>> 5) & 1) ^ this.carryFlag;
};

CPU.prototype.TAS = function(address) {
  this.stackPointer = this.accumulator & this.registerX;
  return this.SHA(address);
};

CPU.prototype.storeValueIntoAccumulator = function(value) {
  this.updateZeroAndNegativeFlag(value);
  return this.accumulator = value;
};

CPU.prototype.storeValueIntoRegisterX = function(value) {
  this.updateZeroAndNegativeFlag(value);
  return this.registerX = value;
};

CPU.prototype.storeValueIntoRegisterY = function(value) {
  this.updateZeroAndNegativeFlag(value);
  return this.registerY = value;
};

CPU.prototype.storeValueIntoMemory = function(address, value) {
  this.updateZeroAndNegativeFlag(value);
  return this.writeByte(address, value);
};

CPU.prototype.storeHighAddressIntoMemory = function(address, register) {
  if (this.pageCrossed) {
    return this.writeByte(address, this.read(address));
  } else {
    return this.writeByte(address, register & ((address >>> 8) + 1));
  }
};

CPU.prototype.addValueToAccumulator = function(operand) {
  var result;
  result = this.accumulator + operand + this.carryFlag;
  this.carryFlag = (result >>> 8) & 1;
  this.overflowFlag = (((this.accumulator ^ result) & (operand ^ result)) >>> 7) & 1;
  return this.storeValueIntoAccumulator(result & 0xFF);
};

CPU.prototype.compareRegisterAndMemory = function(register, address) {
  return this.compareRegisterAndOperand(register, this.readByte(address));
};

CPU.prototype.compareRegisterAndOperand = function(register, operand) {
  var result;
  result = register - operand;
  this.carryFlag = result >= 0;
  this.updateZeroAndNegativeFlag(result);
  return result & 0xFF;
};

CPU.prototype.branchIf = function(condition, address) {
  if (condition) {
    this.programCounter = address;
    this.tick();
    if (this.pageCrossed) {
      return this.tick();
    }
  }
};

CPU.prototype.rotateAccumulatorOrMemory = function(address, rotation, transferCarry) {
  var result;
  if (address != null) {
    result = rotation(this.readByte(address), transferCarry);
    return this.storeValueIntoMemory(address, result);
  } else {
    result = rotation(this.accumulator, transferCarry);
    return this.storeValueIntoAccumulator(result);
  }
};

CPU.prototype.rotateLeft = function(value, transferCarry) {
  value = value << 1 | transferCarry & this.carryFlag;
  this.carryFlag = value >>> 8;
  return value & 0xFF;
};

CPU.prototype.rotateRight = function(value, transferCarry) {
  var oldCarryFlag;
  oldCarryFlag = this.carryFlag;
  this.carryFlag = value & 1;
  return value >>> 1 | (transferCarry & oldCarryFlag) << 7;
};

CPU.prototype.updateZeroAndNegativeFlag = function(value) {
  this.zeroFlag = (value & 0xFF) === 0;
  return this.negativeFlag = (value >>> 7) & 1;
};

CPU.prototype.initOperationsTable = function() {
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
  return this.registerOperation(0x9B, this.TAS, this.absoluteYMode, 0, 1, 0);
};

CPU.prototype.registerOperation = function(operationCode, instruction, addressingMode, pageCrossEnabled, emptyReadCycles, emptyWriteCycles) {
  return this.operationsTable[operationCode] = {
    instruction: instruction,
    addressingMode: addressingMode,
    pageCrossEnabled: pageCrossEnabled,
    emptyReadCycles: emptyReadCycles,
    emptyWriteCycles: emptyWriteCycles
  };
};

CPU.prototype.connectMapper = function(mapper) {
  return this.mapper = mapper;
};
