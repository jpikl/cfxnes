import {log} from '../common';
import {RESET, NMI} from './interrupts';

// CPU operation flags
const F_EXTRA_CYCLE = 1 << 0; // Operation has +1 cycle
const F_DOUBLE_READ = 1 << 1; // Operation always does double read during "absolute X/Y" and "indirect Y" addressing modes

// Interrupt handler addresses
const RESET_ADDRESS = 0xFFFC;
const NMI_ADDRESS = 0xFFFA;
const IRQ_ADDRESS = 0xFFFE;

// Table of all CPU operations
const operations = new Array(0xFF);

export default class CPU {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing CPU');

    // State
    this.halted = false;       // Whether CPU was halter by KIL operation code
    this.operationFlags = 0;   // Flags of the currently executed operation
    this.activeInterrupts = 0; // Bitmap of active interrupts (each type of interrupt has its own bit)
    this.irqDisabled = 0;      // Value that is read from the interrupt flag (see below) at the start of last cycle of each instruction
    this.pageCrossed = 0;      // Whether page was crossed during address computation

    // Registers
    this.programCounter = 0; // 16-bit address of the next instruction to read
    this.stackPointer = 0;   //  8-bit address of top of the stack
    this.accumulator = 0;    //  8-bit accumulator register
    this.registerX = 0;      //  8-bit X register
    this.registerY = 0;      //  8-bit Y register

    // Bits of 8-bit status register
    // - S[4] and S[5] are not physically stored in status register
    // - S[4] is written on stack as 1 during PHP/BRK instructions (break command flag)
    // - S[5] is written on stack as 1 during PHP/BRK instructions and IRQ/NMI
    this.carryFlag = 0;     // S[0] Carry bit of the last operation
    this.zeroFlag = 0;      // S[1] Whether result of the last operation was zero
    this.interruptFlag = 0; // S[2] Whether all IRQ are disabled (this does not affect NMI/reset)
    this.decimalFlag = 0;   // S[3] NES CPU actually does not use this flag, but it's stored in status register and modified by CLD/SED instructions
    this.overflowFlag = 0;  // S[6] Whether result of the last operation caused overflow
    this.negativeFlag = 0;  // S[7] Whether result of the last operation was negative number (bit 7 of the result was 1)

    // Other units
    this.mapper = null;
    this.cpuMemory = null;
    this.dma = null;
    this.ppu = null;
    this.apu = null;
  }

  connect(nes) {
    log.info('Connecting CPU');
    this.cpuMemory = nes.cpuMemory;
    this.ppu = nes.ppu;
    this.apu = nes.apu;
    this.dma = nes.dma;
  }

  setMapper(mapper) {
    this.mapper = mapper;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting CPU');
    this.resetState();
    this.resetMemory();
    this.handleReset();
  }

  resetState() {
    this.activeInterrupts = 0;
    this.halted = false;
    // Program counter will be set to a value at address 0xFFFC during handleReset call
    this.stackPointer = 0; // Will be set to 0x7D during handleReset call
    this.accumulator = 0;
    this.registerX = 0;
    this.registerY = 0;
    this.setStatus(0); // will be set to 0x34 during handleReset call
  }

  resetMemory() {
    for (let i = 0x0000; i < 0x0008; i++) {
      this.cpuMemory.write(i, 0xFF);
    }

    this.cpuMemory.write(0x0008, 0xF7);
    this.cpuMemory.write(0x0009, 0xEF);
    this.cpuMemory.write(0x000A, 0xDF);
    this.cpuMemory.write(0x000F, 0xBF);

    for (let i = 0x0010; i < 0x0800; i++) {
      this.cpuMemory.write(i, 0xFF);
    }

    for (let i = 0x4000; i < 0x4010; i++) {
      this.cpuMemory.write(i, 0x00);
    }

    // Writes to $4015 and $4017 are done during handleReset call
  }

  //=========================================================
  // Execution step
  //=========================================================

  step() {
    const blocked = this.dma.isBlockingCPU() || this.apu.isBlockingCPU();
    if (this.activeInterrupts && !blocked) {
      this.resolveInterrupt();
    }
    if (this.halted || blocked) {
      this.tick(); // Tick everything else
    } else {
      this.readAndExecuteOperation();
    }
  }

  //=========================================================
  // Interrupt handling
  //=========================================================

  resolveInterrupt() {
    if (this.activeInterrupts & RESET) {
      this.handleReset();
    } else if (this.activeInterrupts & NMI) {
      this.handleNMI();
    } else if (this.irqDisabled) {
      return; // IRQ requested, but disabled
    } else {
      this.handleIRQ();
    }
    this.tick();
    this.tick(); // Each interrupt takes 7 cycles
  }

  handleReset() {
    this.writeByte(0x4015, 0x00);                       // Disable all APU channels immediately
    this.writeByte(0x4017, this.apu.frameCounterLast);  // Zero on power up, last written frame counter value otherwise
    this.stackPointer = (this.stackPointer - 3) & 0xFF; // Unlike IRQ/NMI, writing on stack does not modify CPU memory, so we just decrement the stack pointer 3 times
    this.enterInterruptHandler(RESET_ADDRESS);
    this.clearInterrupt(RESET);
    this.tick();
    this.halted = false;
  }

  handleNMI() {
    this.saveStateBeforeInterrupt();
    this.enterInterruptHandler(NMI_ADDRESS);
    this.clearInterrupt(NMI);
  }

  handleIRQ() {
    this.saveStateBeforeInterrupt();
    this.enterInterruptHandler(IRQ_ADDRESS);
    // Unlike reset/NMI, the interrupt flag is not cleared
  }

  saveStateBeforeInterrupt() {
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus());
  }

  enterInterruptHandler(address) {
    this.interruptFlag = 1;
    this.programCounter = this.readWord(address);
  }

  //=========================================================
  // Program execution
  //=========================================================

  readAndExecuteOperation() {
    const operation = this.readOperation();
    if (operation) {
      this.beforeOperation(operation);
      this.executeOperation(operation);
    } else {
      log.warn('CPU halted!');
      this.halted = true; // CPU halt (KIL operation code)
    }
  }

  beforeOperation(operation) {
    // The interrupt flag is checked at the start of last cycle of each instruction.
    // RTI and BRK instructions set the flag before it's read, so the change is immediately visible.
    // CLI, SEI and PLP instructions set the flag after it's read, so the change is delayed.
    // Most of instructions do not modify the flag, so we set the read value for them here.
    this.irqDisabled = this.interruptFlag;
    this.operationFlags = operation[2];
  }

  executeOperation([instruction, addressingMode]) {
    const effectiveAddress = addressingMode.call(this);
    instruction.call(this, effectiveAddress);
  }

  readOperation() {
    return operations[this.readNextProgramByte()];
  }

  readNextProgramByte() {
    return this.readByte(this.moveProgramCounter(1));
  }

  readNextProgramWord() {
    return this.readWord(this.moveProgramCounter(2));
  }

  moveProgramCounter(size) {
    const result = this.programCounter;
    this.programCounter = (this.programCounter + size) & 0xFFFF;
    return result;
  }

  //=========================================================
  // Memory access
  //=========================================================

  readByte(address) {
    this.tick();
    return this.cpuMemory.read(address);
  }

  readWord(address) {
    const highAddress = (address + 1) & 0xFFFF;
    const lowByte = this.readByte(address);
    const highByte = this.readByte(highAddress);
    return (highByte << 8) | lowByte;
  }

  readWordFromSamePage(address) {
    const highAddress = (address & 0xFF00) | ((address + 1) & 0x00FF);
    const lowByte = this.readByte(address);
    const highByte = this.readByte(highAddress);
    return (highByte << 8) | lowByte;
  }

  writeByte(address, value) {
    this.tick();
    this.cpuMemory.write(address, value);
    return value;
  }

  writeWord(address, value) {
    this.writeByte(address, value & 0xFF);
    return this.writeByte((address + 1) & 0xFFFF, value >>> 8);
  }

  readWriteByte(address) {
    const value = this.readByte(address);
    return this.writeByte(address, value); // Some instructions do dummy write before their computation
  }

  //=========================================================
  // Stack access
  //=========================================================

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
    return this.popByte() | (this.popByte() << 8);
  }

  //=========================================================
  // Status register
  //=========================================================

  getStatus() {
    return this.carryFlag
       | (this.zeroFlag << 1)
       | (this.interruptFlag << 2)
       | (this.decimalFlag << 3)
       | (1 << 5)
       | (this.overflowFlag << 6)
       | (this.negativeFlag << 7);
  }

  setStatus(value) {
    this.carryFlag = value & 1;
    this.zeroFlag = (value >>> 1) & 1;
    this.interruptFlag = (value >>> 2) & 1;
    this.decimalFlag = (value >>> 3) & 1;
    this.overflowFlag = (value >>> 6) & 1;
    this.negativeFlag = value >>> 7;
  }

  //=========================================================
  // Interrupt signals
  //=========================================================

  activateInterrupt(type) {
    this.activeInterrupts |= type;
  }

  clearInterrupt(type) {
    this.activeInterrupts &= ~type;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (!this.apu.isBlockingDMA()) {
      this.dma.tick();
      this.mapper.tick();
    }
    this.ppu.tick(); // 3 times faster than CPU
    this.ppu.tick();
    this.ppu.tick();
    this.apu.tick(); // Same rate as CPU
  }

  //=========================================================
  // Basic addressing modes
  //=========================================================

  impliedMode() {
    this.tick();
  }

  accumulatorMode() {
    this.tick();
  }

  immediateMode() {
    return this.moveProgramCounter(1);
  }

  //=========================================================
  // Zero page addressing modes
  //=========================================================

  zeroPageMode() {
    return this.readNextProgramByte();
  }

  zeroPageXMode() {
    return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerX);
  }

  zeroPageYMode() {
    return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerY);
  }

  //=========================================================
  // Absolute addressing modes
  //=========================================================

  absoluteMode() {
    return this.readNextProgramWord();
  }

  absoluteXMode() {
    return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerX);
  }

  absoluteYMode() {
    return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerY);
  }

  //=========================================================
  // Relative addressing mode
  //=========================================================

  relativeMode() {
    const value = this.readNextProgramByte();
    const offset = value & 0x80 ? value - 0x100 : value;
    return (this.programCounter + offset) & 0xFFFF;
  }

  //=========================================================
  // Indirect addressing modes
  //=========================================================

  indirectMode() {
    return this.readWordFromSamePage(this.readNextProgramWord());
  }

  indirectXMode() {
    return this.readWordFromSamePage(this.zeroPageXMode());
  }

  indirectYMode() {
    const base = this.readWordFromSamePage(this.readNextProgramByte());
    return this.computeAbsoluteAddress(base, this.registerY);
  }

  //=========================================================
  // Address computation
  //=========================================================

  computeZeroPageAddress(base, offset) {
    this.readByte(base); // Dummy read
    return (base + offset) & 0xFF;
  }

  computeAbsoluteAddress(base, offset) {
    const result = (base + offset) & 0xFFFF;
    this.pageCrossed = isDifferentPage(base, result);
    if ((this.operationFlags & F_DOUBLE_READ) || this.pageCrossed) {
      this.readByte((base & 0xFF00) | (result & 0x00FF)); // Dummy read from address before fixing page overflow in its higher byte
    }
    return result;
  }

  //=========================================================
  // No operation instruction
  //=========================================================

  NOP() {
    if (this.operationFlags & F_EXTRA_CYCLE) {
      this.tick();
    }
  }

  //=========================================================
  // Clear flag instructions
  //=========================================================

  CLC() {
    this.carryFlag = 0;
  }

  CLI() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 0;
  }

  CLD() {
    this.decimalFlag = 0;
  }

  CLV() {
    this.overflowFlag = 0;
  }

  //=========================================================
  // Set flag instructions
  //=========================================================

  SEC() {
    this.carryFlag = 1;
  }

  SEI() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 1;
  }

  SED() {
    this.decimalFlag = 1;
  }

  //=========================================================
  // Memory write instructions
  //=========================================================

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

  SHA(address) { // Also known as AHX
    this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
  }

  SHX(address) { // Also known as SXA
    this.storeHighAddressIntoMemory(address, this.registerX);
  }

  SHY(address) { // Also known as SYA
    this.storeHighAddressIntoMemory(address, this.registerY);
  }

  //=========================================================
  // Memory read instructions
  //=========================================================

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
    const value = this.readByte(address);
    this.storeValueIntoAccumulator(value);
    this.storeValueIntoRegisterX(value);
  }

  LAS(address) {
    this.stackPointer &= this.readByte(address);
    this.storeValueIntoAccumulator(this.stackPointer);
    this.storeValueIntoRegisterX(this.stackPointer);
  }

  //=========================================================
  // Register transfer instructions
  //=========================================================

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

  //=========================================================
  // Stack push instructions
  //=========================================================

  PHA() {
    this.pushByte(this.accumulator);
  }

  PHP() {
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
  }

  //=========================================================
  // Stack pull instructions
  //=========================================================

  PLA() {
    this.tick();
    this.storeValueIntoAccumulator(this.popByte());
  }

  PLP() {
    this.tick();
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.setStatus(this.popByte());
  }

  //=========================================================
  // Accumulator bitwise instructions
  //=========================================================

  AND(address) {
    return this.storeValueIntoAccumulator(this.accumulator & this.readByte(address));
  }

  ORA(address) {
    this.storeValueIntoAccumulator(this.accumulator | this.readByte(address));
  }

  EOR(address) {
    this.storeValueIntoAccumulator(this.accumulator ^ this.readByte(address));
  }

  BIT(address) {
    const value = this.readByte(address);
    this.zeroFlag = (!(this.accumulator & value)) | 0;
    this.overflowFlag = (value >>> 6) & 1;
    this.negativeFlag = value >>> 7;
  }

  //=========================================================
  // Increment instructions
  //=========================================================

  INC(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) + 1) & 0xFF);
  }

  INX() {
    this.storeValueIntoRegisterX((this.registerX + 1) & 0xFF);
  }

  INY() {
    this.storeValueIntoRegisterY((this.registerY + 1) & 0xFF);
  }

  //=========================================================
  // Decrement instructions
  //=========================================================

  DEC(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) - 1) & 0xFF);
  }

  DEX() {
    this.storeValueIntoRegisterX((this.registerX - 1) & 0xFF);
  }

  DEY() {
    this.storeValueIntoRegisterY((this.registerY - 1) & 0xFF);
  }

  //=========================================================
  // Comparison instructions
  //=========================================================

  CMP(address) {
    this.compareRegisterAndMemory(this.accumulator, address);
  }

  CPX(address) {
    this.compareRegisterAndMemory(this.registerX, address);
  }

  CPY(address) {
    this.compareRegisterAndMemory(this.registerY, address);
  }

  //=========================================================
  // Branching instructions
  //=========================================================

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

  //=========================================================
  // Jump / subroutine instructions
  //=========================================================

  JMP(address) {
    this.programCounter = address;
  }

  JSR(address) {
    this.tick();
    this.pushWord((this.programCounter - 1) & 0xFFFF); // The pushed address must be the end of the current instruction
    this.programCounter = address;
  }

  RTS() {
    this.tick();
    this.tick();
    this.programCounter = (this.popWord() + 1) & 0xFFFF; // We decremented the address when pushing it during JSR
  }

  //=========================================================
  // Interrupt control instructions
  //=========================================================

  BRK() {
    this.moveProgramCounter(1);  // BRK is 2 byte instruction (skip the unused byte)
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
    this.irqDisabled = 1;   // Immediate change to IRQ disablement
    this.interruptFlag = 1; // Immediate change to IRQ disablement
    this.programCounter = this.readWord(this.activeInterrupts & NMI ? NMI_ADDRESS : IRQ_ADDRESS); // Active NMI hijacks BRK
  }

  RTI() {
    this.tick();
    this.setStatus(this.popByte());
    this.irqDisabled = this.interruptFlag; // Immediate change to IRQ disablement
    this.programCounter = this.popWord();
  }

  //=========================================================
  // Addition / subtraction instructions
  //=========================================================

  ADC(address) {
    this.addValueToAccumulator(this.readByte(address));
  }

  SBC(address) {
    this.addValueToAccumulator((this.readByte(address)) ^ 0xFF); // With internal carry increment makes negative operand
  }

  //=========================================================
  // Shifting / rotation instructions
  //=========================================================

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

  //=========================================================
  // Hybrid instructions
  //=========================================================

  /* eslint-disable new-cap */

  DCP(address) {
    this.compareRegisterAndOperand(this.accumulator, this.DEC(address));
  }

  ISB(address) {
    this.addValueToAccumulator((this.INC(address)) ^ 0xFF); // With internal carry increment makes negative operand
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

  XAA(address) { // Also known as ANE
    this.storeValueIntoAccumulator(this.registerX & this.AND(address));
  }

  RRA(address) {
    this.addValueToAccumulator(this.ROR(address));
  }

  AXS(address) { // Also known as SBX
    this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
  }

  ANC(address) {
    this.rotateLeft(this.AND(address), false); // rotateLeft computes carry
  }

  ALR(address) {
    this.AND(address);
    this.LSR(null);
  }

  ARR(address) {
    this.AND(address);
    this.ROR(null);
    this.carryFlag = (this.accumulator >>> 6) & 1;
    this.overflowFlag = ((this.accumulator >>> 5) & 1) ^ this.carryFlag;
  }

  TAS(address) { // Also known as SHS
    this.stackPointer = this.accumulator & this.registerX;
    this.SHA(address);
  }

  /* eslint-enable new-cap */

  //=========================================================
  // Instruction helpers
  //=========================================================

  storeValueIntoAccumulator(value) {
    this.updateZeroAndNegativeFlag(value);
    return (this.accumulator = value);
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
      this.writeByte(address, this.cpuMemory.read(address)); // Just copy the same value
    } else {
      this.writeByte(address, register & ((address >>> 8) + 1));
    }
  }

  addValueToAccumulator(operand) {
    const result = this.accumulator + operand + this.carryFlag;
    this.carryFlag = (result >>> 8) & 1;
    this.overflowFlag = (((this.accumulator ^ result) & (operand ^ result)) >>> 7) & 1; // Signed overflow
    return this.storeValueIntoAccumulator(result & 0xFF);
  }

  compareRegisterAndMemory(register, address) {
    return this.compareRegisterAndOperand(register, this.readByte(address));
  }

  compareRegisterAndOperand(register, operand) {
    const result = register - operand;
    this.carryFlag = (result >= 0) | 0; // Unsigned comparison (bit 8 is actually the result sign)
    this.updateZeroAndNegativeFlag(result); // Not a signed comparison
    return result & 0xFF;
  }

  branchIf(condition, address) {
    if (condition) {
      this.tick();
      if (isDifferentPage(this.programCounter, address)) {
        this.tick();
      }
      this.programCounter = address;
    }
  }

  rotateAccumulatorOrMemory(address, rotation, transferCarry) {
    if (address != null) {
      const result = rotation.call(this, this.readWriteByte(address), transferCarry);
      return this.storeValueIntoMemory(address, result);
    }
    const result = rotation.call(this, this.accumulator, transferCarry);
    return this.storeValueIntoAccumulator(result);
  }

  rotateLeft(value, transferCarry) {
    const carry = transferCarry & this.carryFlag;
    this.carryFlag = value >>> 7;
    return ((value << 1) | carry) & 0xFF;
  }

  rotateRight(value, transferCarry) {
    const carry = (transferCarry & this.carryFlag) << 7;
    this.carryFlag = value & 1;
    return (value >>> 1) | carry;
  }

  updateZeroAndNegativeFlag(value) {
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
  }

}

//=========================================================
// Utils
//=========================================================

function isDifferentPage(address1, address2) {
  return (address1 & 0xFF00) !== (address2 & 0xFF00);
}

//=========================================================
// Operation table initialization
//=========================================================

const proto = CPU.prototype;

//=========================================================
// No operation instruction
//=========================================================

operations[0x1A] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0x3A] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0x5A] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0x7A] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0xDA] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0xEA] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles
operations[0xFA] = [proto.NOP, proto.impliedMode, 0]; // 2 cycles

operations[0x80] = [proto.NOP, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0x82] = [proto.NOP, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0x89] = [proto.NOP, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0xC2] = [proto.NOP, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0xE2] = [proto.NOP, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles

operations[0x04] = [proto.NOP, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles
operations[0x44] = [proto.NOP, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles
operations[0x64] = [proto.NOP, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles

operations[0x14] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x34] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x54] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x74] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0xD4] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0xF4] = [proto.NOP, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles

operations[0x0C] = [proto.NOP, proto.absoluteMode, F_EXTRA_CYCLE]; // 4 cycles

operations[0x1C] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x3C] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x5C] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x7C] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0xDC] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0xFC] = [proto.NOP, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)

//=========================================================
// Clear flag instructions
//=========================================================

operations[0x18] = [proto.CLC, proto.impliedMode, 0]; // 2 cycles
operations[0x58] = [proto.CLI, proto.impliedMode, 0]; // 2 cycles
operations[0xD8] = [proto.CLD, proto.impliedMode, 0]; // 2 cycles
operations[0xB8] = [proto.CLV, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Set flag instructions
//=========================================================

operations[0x38] = [proto.SEC, proto.impliedMode, 0]; // 2 cycles
operations[0x78] = [proto.SEI, proto.impliedMode, 0]; // 2 cycles
operations[0xF8] = [proto.SED, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Memory write instructions
//=========================================================

operations[0x85] = [proto.STA, proto.zeroPageMode, 0];  // 3 cycles
operations[0x95] = [proto.STA, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x8D] = [proto.STA, proto.absoluteMode, 0];  // 4 cycles
operations[0x9D] = [proto.STA, proto.absoluteXMode, F_DOUBLE_READ]; // 5 cycles
operations[0x99] = [proto.STA, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x81] = [proto.STA, proto.indirectXMode, 0]; // 6 cycles
operations[0x91] = [proto.STA, proto.indirectYMode, F_DOUBLE_READ]; // 6 cycles

operations[0x86] = [proto.STX, proto.zeroPageMode, 0];  // 3 cycles
operations[0x96] = [proto.STX, proto.zeroPageYMode, 0]; // 4 cycles
operations[0x8E] = [proto.STX, proto.absoluteMode, 0];  // 4 cycles

operations[0x87] = [proto.SAX, proto.zeroPageMode, 0];  // 3 cycles
operations[0x97] = [proto.SAX, proto.zeroPageYMode, 0]; // 4 cycles
operations[0x8F] = [proto.SAX, proto.absoluteMode, 0];  // 4 cycles
operations[0x83] = [proto.SAX, proto.indirectXMode, 0]; // 6 cycles

operations[0x84] = [proto.STY, proto.zeroPageMode, 0];  // 3 cycles
operations[0x94] = [proto.STY, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x8C] = [proto.STY, proto.absoluteMode, 0];  // 4 cycles

operations[0x93] = [proto.SHA, proto.indirectYMode, F_DOUBLE_READ]; // 6 cycles
operations[0x9F] = [proto.SHA, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x9E] = [proto.SHX, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x9C] = [proto.SHY, proto.absoluteXMode, F_DOUBLE_READ]; // 5 cycles

//=========================================================
// Memory read instructions
//=========================================================

operations[0xA9] = [proto.LDA, proto.immediateMode, 0]; // 2 cycles
operations[0xA5] = [proto.LDA, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB5] = [proto.LDA, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xAD] = [proto.LDA, proto.absoluteMode, 0];  // 4 cycles
operations[0xBD] = [proto.LDA, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xB9] = [proto.LDA, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xA1] = [proto.LDA, proto.indirectXMode, 0]; // 6 cycles
operations[0xB1] = [proto.LDA, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xA2] = [proto.LDX, proto.immediateMode, 0]; // 2 cycles
operations[0xA6] = [proto.LDX, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB6] = [proto.LDX, proto.zeroPageYMode, 0]; // 4 cycles
operations[0xAE] = [proto.LDX, proto.absoluteMode, 0];  // 4 cycles
operations[0xBE] = [proto.LDX, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)

operations[0xA0] = [proto.LDY, proto.immediateMode, 0]; // 2 cycles
operations[0xA4] = [proto.LDY, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB4] = [proto.LDY, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xAC] = [proto.LDY, proto.absoluteMode, 0];  // 4 cycles
operations[0xBC] = [proto.LDY, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)

operations[0xAB] = [proto.LAX, proto.immediateMode, 0]; // 2 cycles
operations[0xA7] = [proto.LAX, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB7] = [proto.LAX, proto.zeroPageYMode, 0]; // 4 cycles
operations[0xAF] = [proto.LAX, proto.absoluteMode, 0];  // 4 cycles
operations[0xBF] = [proto.LAX, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xA3] = [proto.LAX, proto.indirectXMode, 0]; // 6 cycles
operations[0xB3] = [proto.LAX, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xBB] = [proto.LAS, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)

//=========================================================
// Register transfer instructions
//=========================================================

operations[0xAA] = [proto.TAX, proto.impliedMode, 0]; // 2 cycles
operations[0xA8] = [proto.TAY, proto.impliedMode, 0]; // 2 cycles
operations[0x8A] = [proto.TXA, proto.impliedMode, 0]; // 2 cycles
operations[0x98] = [proto.TYA, proto.impliedMode, 0]; // 2 cycles
operations[0x9A] = [proto.TXS, proto.impliedMode, 0]; // 2 cycles
operations[0xBA] = [proto.TSX, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Stack push instructions
//=========================================================

operations[0x48] = [proto.PHA, proto.impliedMode, 0]; // 3 cycles
operations[0x08] = [proto.PHP, proto.impliedMode, 0]; // 3 cycles

//=========================================================
// Stack pull instructions
//=========================================================

operations[0x68] = [proto.PLA, proto.impliedMode, 0]; // 4 cycles
operations[0x28] = [proto.PLP, proto.impliedMode, 0]; // 4 cycles

//=========================================================
// Accumulator bitwise instructions
//=========================================================

operations[0x29] = [proto.AND, proto.immediateMode, 0]; // 2 cycles
operations[0x25] = [proto.AND, proto.zeroPageMode, 0];  // 3 cycles
operations[0x35] = [proto.AND, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x2D] = [proto.AND, proto.absoluteMode, 0];  // 4 cycles
operations[0x3D] = [proto.AND, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x39] = [proto.AND, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x21] = [proto.AND, proto.indirectXMode, 0]; // 6 cycles
operations[0x31] = [proto.AND, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x09] = [proto.ORA, proto.immediateMode, 0]; // 2 cycles
operations[0x05] = [proto.ORA, proto.zeroPageMode, 0];  // 3 cycles
operations[0x15] = [proto.ORA, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x0D] = [proto.ORA, proto.absoluteMode, 0];  // 4 cycles
operations[0x1D] = [proto.ORA, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x19] = [proto.ORA, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x01] = [proto.ORA, proto.indirectXMode, 0]; // 6 cycles
operations[0x11] = [proto.ORA, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x49] = [proto.EOR, proto.immediateMode, 0]; // 2 cycles
operations[0x45] = [proto.EOR, proto.zeroPageMode, 0];  // 3 cycles
operations[0x55] = [proto.EOR, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x4D] = [proto.EOR, proto.absoluteMode, 0];  // 4 cycles
operations[0x5D] = [proto.EOR, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x59] = [proto.EOR, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x41] = [proto.EOR, proto.indirectXMode, 0]; // 6 cycles
operations[0x51] = [proto.EOR, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x24] = [proto.BIT, proto.zeroPageMode, 0]; // 3 cycles
operations[0x2C] = [proto.BIT, proto.absoluteMode, 0]; // 4 cycles

//=========================================================
// Increment instructions
//=========================================================

operations[0xE6] = [proto.INC, proto.zeroPageMode, 0];  // 5 cycles
operations[0xF6] = [proto.INC, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xEE] = [proto.INC, proto.absoluteMode, 0];  // 6 cycles
operations[0xFE] = [proto.INC, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0xE8] = [proto.INX, proto.impliedMode, 0]; // 2 cycles
operations[0xC8] = [proto.INY, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Decrement instructions
//=========================================================

operations[0xC6] = [proto.DEC, proto.zeroPageMode, 0];  // 5 cycles
operations[0xD6] = [proto.DEC, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xCE] = [proto.DEC, proto.absoluteMode, 0];  // 6 cycles
operations[0xDE] = [proto.DEC, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0xCA] = [proto.DEX, proto.impliedMode, 0]; // 2 cycles
operations[0x88] = [proto.DEY, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Comparison instructions
//=========================================================

operations[0xC9] = [proto.CMP, proto.immediateMode, 0]; // 2 cycles
operations[0xC5] = [proto.CMP, proto.zeroPageMode, 0];  // 3 cycles
operations[0xD5] = [proto.CMP, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xCD] = [proto.CMP, proto.absoluteMode, 0];  // 4 cycles
operations[0xDD] = [proto.CMP, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xD9] = [proto.CMP, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xC1] = [proto.CMP, proto.indirectXMode, 0]; // 6 cycles
operations[0xD1] = [proto.CMP, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xE0] = [proto.CPX, proto.immediateMode, 0]; // 2 cycles
operations[0xE4] = [proto.CPX, proto.zeroPageMode, 0];  // 3 cycles
operations[0xEC] = [proto.CPX, proto.absoluteMode, 0];  // 4 cycles

operations[0xC0] = [proto.CPY, proto.immediateMode, 0]; // 2 cycles
operations[0xC4] = [proto.CPY, proto.zeroPageMode, 0];  // 3 cycles
operations[0xCC] = [proto.CPY, proto.absoluteMode, 0];  // 4 cycles

//=========================================================
// Branching instructions
//=========================================================

operations[0x90] = [proto.BCC, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0xB0] = [proto.BCS, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0xD0] = [proto.BNE, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0xF0] = [proto.BEQ, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0x50] = [proto.BVC, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0x70] = [proto.BVS, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0x10] = [proto.BPL, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0x30] = [proto.BMI, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

//=========================================================
// Jump / subroutine instructions
//=========================================================

operations[0x4C] = [proto.JMP, proto.absoluteMode, 0]; // 3 cycles
operations[0x6C] = [proto.JMP, proto.indirectMode, 0]; // 5 cycles
operations[0x20] = [proto.JSR, proto.absoluteMode, 0]; // 6 cycles
operations[0x60] = [proto.RTS, proto.impliedMode, 0];  // 6 cycles

//=========================================================
// Interrupt control instructions
//=========================================================

operations[0x00] = [proto.BRK, proto.impliedMode, 0]; // 7 cycles
operations[0x40] = [proto.RTI, proto.impliedMode, 0]; // 6 cycles

//=========================================================
// Addition / subtraction instructions
//=========================================================

operations[0x69] = [proto.ADC, proto.immediateMode, 0]; // 2 cycles
operations[0x65] = [proto.ADC, proto.zeroPageMode, 0];  // 3 cycles
operations[0x75] = [proto.ADC, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x6D] = [proto.ADC, proto.absoluteMode, 0];  // 4 cycles
operations[0x7D] = [proto.ADC, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x79] = [proto.ADC, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x61] = [proto.ADC, proto.indirectXMode, 0]; // 6 cycles
operations[0x71] = [proto.ADC, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xE9] = [proto.SBC, proto.immediateMode, 0]; // 2 cycles
operations[0xEB] = [proto.SBC, proto.immediateMode, 0]; // 2 cycles
operations[0xE5] = [proto.SBC, proto.zeroPageMode, 0];  // 3 cycles
operations[0xF5] = [proto.SBC, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xED] = [proto.SBC, proto.absoluteMode, 0];  // 4 cycles
operations[0xFD] = [proto.SBC, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xF9] = [proto.SBC, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xE1] = [proto.SBC, proto.indirectXMode, 0]; // 6 cycles
operations[0xF1] = [proto.SBC, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

//=========================================================
// Shifting / rotation instructions
//=========================================================

operations[0x0A] = [proto.ASL, proto.accumulatorMode, 0]; // 2 cycles
operations[0x06] = [proto.ASL, proto.zeroPageMode, 0];    // 5 cycles
operations[0x16] = [proto.ASL, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x0E] = [proto.ASL, proto.absoluteMode, 0];    // 6 cycles
operations[0x1E] = [proto.ASL, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x4A] = [proto.LSR, proto.accumulatorMode, 0]; // 2 cycles
operations[0x46] = [proto.LSR, proto.zeroPageMode, 0];    // 5 cycles
operations[0x56] = [proto.LSR, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x4E] = [proto.LSR, proto.absoluteMode, 0];    // 6 cycles
operations[0x5E] = [proto.LSR, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x2A] = [proto.ROL, proto.accumulatorMode, 0]; // 2 cycles
operations[0x26] = [proto.ROL, proto.zeroPageMode, 0];    // 5 cycles
operations[0x36] = [proto.ROL, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x2E] = [proto.ROL, proto.absoluteMode, 0];    // 6 cycles
operations[0x3E] = [proto.ROL, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x6A] = [proto.ROR, proto.accumulatorMode, 0]; // 2 cycles
operations[0x66] = [proto.ROR, proto.zeroPageMode, 0];    // 5 cycles
operations[0x76] = [proto.ROR, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x6E] = [proto.ROR, proto.absoluteMode, 0];    // 6 cycles
operations[0x7E] = [proto.ROR, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

//=========================================================
// Hybrid instructions
//=========================================================

operations[0xC7] = [proto.DCP, proto.zeroPageMode, 0];  // 5 cycles
operations[0xD7] = [proto.DCP, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xCF] = [proto.DCP, proto.absoluteMode, 0];  // 6 cycles
operations[0xDF] = [proto.DCP, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0xDB] = [proto.DCP, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0xC3] = [proto.DCP, proto.indirectXMode, 0]; // 8 cycles
operations[0xD3] = [proto.DCP, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0xE7] = [proto.ISB, proto.zeroPageMode, 0];  // 5 cycles
operations[0xF7] = [proto.ISB, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xEF] = [proto.ISB, proto.absoluteMode, 0];  // 6 cycles
operations[0xFF] = [proto.ISB, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0xFB] = [proto.ISB, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0xE3] = [proto.ISB, proto.indirectXMode, 0]; // 8 cycles
operations[0xF3] = [proto.ISB, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x07] = [proto.SLO, proto.zeroPageMode, 0];  // 5 cycles
operations[0x17] = [proto.SLO, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x0F] = [proto.SLO, proto.absoluteMode, 0];  // 6 cycles
operations[0x1F] = [proto.SLO, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x1B] = [proto.SLO, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x03] = [proto.SLO, proto.indirectXMode, 0]; // 8 cycles
operations[0x13] = [proto.SLO, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x47] = [proto.SRE, proto.zeroPageMode, 0];  // 5 cycles
operations[0x57] = [proto.SRE, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x4F] = [proto.SRE, proto.absoluteMode, 0];  // 6 cycles
operations[0x5F] = [proto.SRE, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x5B] = [proto.SRE, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x43] = [proto.SRE, proto.indirectXMode, 0]; // 8 cycles
operations[0x53] = [proto.SRE, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x27] = [proto.RLA, proto.zeroPageMode, 0];  // 5 cycles
operations[0x37] = [proto.RLA, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x2F] = [proto.RLA, proto.absoluteMode, 0];  // 6 cycles
operations[0x3F] = [proto.RLA, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x3B] = [proto.RLA, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x23] = [proto.RLA, proto.indirectXMode, 0]; // 8 cycles
operations[0x33] = [proto.RLA, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x8B] = [proto.XAA, proto.immediateMode, 0]; // 2 cycles

operations[0x67] = [proto.RRA, proto.zeroPageMode, 0];  // 5 cycles
operations[0x77] = [proto.RRA, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x6F] = [proto.RRA, proto.absoluteMode, 0];  // 6 cycles
operations[0x7F] = [proto.RRA, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x7B] = [proto.RRA, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x63] = [proto.RRA, proto.indirectXMode, 0]; // 8 cycles
operations[0x73] = [proto.RRA, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0xCB] = [proto.AXS, proto.immediateMode, 0]; // 2 cycles

operations[0x0B] = [proto.ANC, proto.immediateMode, 0]; // 2 cycles
operations[0x2B] = [proto.ANC, proto.immediateMode, 0]; // 2 cycles

operations[0x4B] = [proto.ALR, proto.immediateMode, 0]; // 2 cycles
operations[0x6B] = [proto.ARR, proto.immediateMode, 0]; // 2 cycles

operations[0x9B] = [proto.TAS, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
