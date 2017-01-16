import log from '../common/log';
import {RESET, NMI} from './interrupts';
import Operation from './Operation';

// CPU operation flags
const F_EXTRA_CYCLE = 1 << 0; // Operation has +1 cycle
const F_DOUBLE_READ = 1 << 1; // Operation always does double read during "absolute X/Y" and "indirect Y" addresing modes

// Interrupt handler addresses
const RESET_ADDRESS = 0xFFFC;
const NMI_ADDRESS = 0xFFFA;
const IRQ_ADDRESS = 0xFFFE;

export default class CPU {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing CPU');
    this.initOperations();
  }

  connect(nes) {
    log.info('Connecting CPU');
    this.cpuMemory = nes.cpuMemory;
    this.ppu = nes.ppu;
    this.apu = nes.apu;
    this.dma = nes.dma;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Reseting CPU');
    this.resetRegisters();
    this.resetVariables();
    this.resetMemory();
    this.handleReset(); // Will appropriately initialize some CPU registers and $4015/$4017 registers (see bellow)
  }

  resetRegisters() {
    this.programCounter = 0; // 16-bit (will be initialized to value at address 0xFFFC during handleReset())
    this.stackPointer = 0;   //  8-bit (will be set to 0x7D during handleReset())
    this.accumulator = 0;    //  8-bit
    this.registerX = 0;      //  8-bit
    this.registerY = 0;      //  8-bit
    this.setStatus(0);       //  8-bit (will be initialized to 0x34 during handleReset(); actually, only bit 2 will be set,
                             //         because bits 4 and 5 are not physically stored in status register)
  }

  resetVariables() {
    this.activeInterrupts = 0; // Bitmap of active interrupts (each type of interrupt has its own bit)
    this.halted = false;       // Whether KIL opcode was readed
  }

  resetMemory() {
    for (let i = 0x0000; i < 0x0800; i++) {
      this.cpuMemory.write(i, 0xFF);
    }
    for (let i = 0x4000; i < 0x4010; i++) {
      this.cpuMemory.write(i, 0x00);
    }
    this.cpuMemory.write(0x0008, 0xF7);
    this.cpuMemory.write(0x0009, 0xEF);
    this.cpuMemory.write(0x000A, 0xDF);
    this.cpuMemory.write(0x000F, 0xBF);
    // Writes to $4015 and $4017 are done during handleReset()
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
    this.writeByte(0x4015, 0x00);                       // Disable all APU channels immediatelly
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
      // The interrupt flag is checked at the start of last cycle of each instruction.
      // RTI and BRK instructions set the flag before it's read, so the change is immediately visible.
      // CLI, SEI and PLP instructions set the flag after it's read, so the change is delayed.
      // Most of instructions do not modify the flag, so we set the read value for them here.
      this.irqDisabled = this.interruptFlag;
      this.operationFlags = operation.flags;
      this.executeOperation(operation);
    } else {
      log.warn('CPU halted!');
      this.halted = true; // CPU halt (KIL operation code)
    }
  }

  executeOperation(operation) {
    const effectiveAddress = operation.addressingMode.call(this);
    operation.instruction.call(this, effectiveAddress);
  }

  readOperation() {
    return this.operations[this.readNextProgramByte()];
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

  // Bits 4 and 5 are not physically stored in status register
  // - bit 4 is written on stack as 1 during PHP/BRK instructions (break command flag)
  // - bit 5 is written on stack as 1 during PHP/BRK instructions and IRQ/NMI

  getStatus() {
    return this.carryFlag          // S[0] - carry bit of the last operation
       | (this.zeroFlag << 1)       // S[1] - whether result of the last operation was zero
       | (this.interruptFlag << 2)  // S[2] - whether IRQs are disabled (this does not affect NMI/reset)
       | (this.decimalFlag << 3)    // S[3] - NES CPU actually does not use this flag, but it's stored in status register and modified by CLD/SED instructions
       | (1 << 5)                   // S[5] - allways 1, see comment above
       | (this.overflowFlag << 6)   // S[6] - wheter result of the last operation caused overflow
       | (this.negativeFlag << 7);  // S[7] - wheter result of the last operation was negative number (bit 7 of the result was 1)
  }

  setStatus(value) {
    this.carryFlag = value & 1;             // S[0]
    this.zeroFlag = (value >>> 1) & 1;      // S[1]
    this.interruptFlag = (value >>> 2) & 1; // S[2]
    this.decimalFlag = (value >>> 3) & 1;   // S[3]
    this.overflowFlag = (value >>> 6) & 1;  // S[6]
    this.negativeFlag = value >>> 7;        // S[7]
  }

  //=========================================================
  // Input signals
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
    this.pageCrossed = this.isDifferentPage(base, result);
    if ((this.operationFlags & F_DOUBLE_READ) || this.pageCrossed) {
      this.readByte((base & 0xFF00) | (result & 0x00FF)); // Dummy read from address before fixing page overflow in its higher byte
    }
    return result;
  }

  isDifferentPage(address1, address2) {
    return (address1 & 0xFF00) !== (address2 & 0xFF00);
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
    this.zeroFlag = (this.accumulator & value) === 0;
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
    this.moveProgramCounter(1);             // BRK is 2 byte instruction (skip the unused byte)
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
    this.irqDisabled = this.interruptFlag = 1; // Immediate change to IRQ disablement
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
    this.addValueToAccumulator((this.readByte(address)) ^ 0xFF); // With internal carry incremment makes negative operand
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
    this.addValueToAccumulator((this.INC(address)) ^ 0xFF); // With internal carry incremment makes negative operand
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
    this.carryFlag = result >= 0; // Unsigned comparison (bit 8 is actually the result sign)
    this.updateZeroAndNegativeFlag(result); // Not a signed comparison
    return result & 0xFF;
  }

  branchIf(condition, address) {
    if (condition) {
      this.tick();
      if (this.isDifferentPage(this.programCounter, address)) {
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
    this.zeroFlag = (value & 0xFF) === 0;
    this.negativeFlag = (value >>> 7) & 1;
  }

  //=========================================================
  // Operations table
  //=========================================================

  initOperations() {
    this.operations = new Array(0xFF);

    //=========================================================
    // No operation instruction
    //=========================================================

    this.operations[0x1A] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0x3A] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0x5A] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0x7A] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0xDA] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0xEA] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles
    this.operations[0xFA] = new Operation(this.NOP, this.impliedMode, 0); // 2 cycles

    this.operations[0x80] = new Operation(this.NOP, this.immediateMode, F_EXTRA_CYCLE); // 2 cycles
    this.operations[0x82] = new Operation(this.NOP, this.immediateMode, F_EXTRA_CYCLE); // 2 cycles
    this.operations[0x89] = new Operation(this.NOP, this.immediateMode, F_EXTRA_CYCLE); // 2 cycles
    this.operations[0xC2] = new Operation(this.NOP, this.immediateMode, F_EXTRA_CYCLE); // 2 cycles
    this.operations[0xE2] = new Operation(this.NOP, this.immediateMode, F_EXTRA_CYCLE); // 2 cycles

    this.operations[0x04] = new Operation(this.NOP, this.zeroPageMode, F_EXTRA_CYCLE); // 3 cycles
    this.operations[0x44] = new Operation(this.NOP, this.zeroPageMode, F_EXTRA_CYCLE); // 3 cycles
    this.operations[0x64] = new Operation(this.NOP, this.zeroPageMode, F_EXTRA_CYCLE); // 3 cycles

    this.operations[0x14] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles
    this.operations[0x34] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles
    this.operations[0x54] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles
    this.operations[0x74] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles
    this.operations[0xD4] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles
    this.operations[0xF4] = new Operation(this.NOP, this.zeroPageXMode, F_EXTRA_CYCLE); // 4 cycles

    this.operations[0x0C] = new Operation(this.NOP, this.absoluteMode, F_EXTRA_CYCLE); // 4 cycles

    this.operations[0x1C] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)
    this.operations[0x3C] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)
    this.operations[0x5C] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)
    this.operations[0x7C] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)
    this.operations[0xDC] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)
    this.operations[0xFC] = new Operation(this.NOP, this.absoluteXMode, F_EXTRA_CYCLE); // 4 cycles (+1 if page crossed)

    //=========================================================
    // Clear flag instructions
    //=========================================================

    this.operations[0x18] = new Operation(this.CLC, this.impliedMode, 0); // 2 cycles
    this.operations[0x58] = new Operation(this.CLI, this.impliedMode, 0); // 2 cycles
    this.operations[0xD8] = new Operation(this.CLD, this.impliedMode, 0); // 2 cycles
    this.operations[0xB8] = new Operation(this.CLV, this.impliedMode, 0); // 2 cycles

    //=========================================================
    // Set flag instructions
    //=========================================================

    this.operations[0x38] = new Operation(this.SEC, this.impliedMode, 0); // 2 cycles
    this.operations[0x78] = new Operation(this.SEI, this.impliedMode, 0); // 2 cycles
    this.operations[0xF8] = new Operation(this.SED, this.impliedMode, 0); // 2 cycles

    //=========================================================
    // Memory write instructions
    //=========================================================

    this.operations[0x85] = new Operation(this.STA, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x95] = new Operation(this.STA, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x8D] = new Operation(this.STA, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x9D] = new Operation(this.STA, this.absoluteXMode, F_DOUBLE_READ); // 5 cycles
    this.operations[0x99] = new Operation(this.STA, this.absoluteYMode, F_DOUBLE_READ); // 5 cycles
    this.operations[0x81] = new Operation(this.STA, this.indirectXMode, 0); // 6 cycles
    this.operations[0x91] = new Operation(this.STA, this.indirectYMode, F_DOUBLE_READ); // 6 cycles

    this.operations[0x86] = new Operation(this.STX, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x96] = new Operation(this.STX, this.zeroPageYMode, 0); // 4 cycles
    this.operations[0x8E] = new Operation(this.STX, this.absoluteMode, 0);  // 4 cycles

    this.operations[0x87] = new Operation(this.SAX, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x97] = new Operation(this.SAX, this.zeroPageYMode, 0); // 4 cycles
    this.operations[0x8F] = new Operation(this.SAX, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x83] = new Operation(this.SAX, this.indirectXMode, 0); // 6 cycles

    this.operations[0x84] = new Operation(this.STY, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x94] = new Operation(this.STY, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x8C] = new Operation(this.STY, this.absoluteMode, 0);  // 4 cycles

    this.operations[0x93] = new Operation(this.SHA, this.indirectYMode, F_DOUBLE_READ); // 6 cycles
    this.operations[0x9F] = new Operation(this.SHA, this.absoluteYMode, F_DOUBLE_READ); // 5 cycles
    this.operations[0x9E] = new Operation(this.SHX, this.absoluteYMode, F_DOUBLE_READ); // 5 cycles
    this.operations[0x9C] = new Operation(this.SHY, this.absoluteXMode, F_DOUBLE_READ); // 5 cycles

    //=========================================================
    // Memory read instructions
    //=========================================================

    this.operations[0xA9] = new Operation(this.LDA, this.immediateMode, 0); // 2 cycles
    this.operations[0xA5] = new Operation(this.LDA, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xB5] = new Operation(this.LDA, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0xAD] = new Operation(this.LDA, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xBD] = new Operation(this.LDA, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xB9] = new Operation(this.LDA, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xA1] = new Operation(this.LDA, this.indirectXMode, 0); // 6 cycles
    this.operations[0xB1] = new Operation(this.LDA, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0xA2] = new Operation(this.LDX, this.immediateMode, 0); // 2 cycles
    this.operations[0xA6] = new Operation(this.LDX, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xB6] = new Operation(this.LDX, this.zeroPageYMode, 0); // 4 cycles
    this.operations[0xAE] = new Operation(this.LDX, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xBE] = new Operation(this.LDX, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)

    this.operations[0xA0] = new Operation(this.LDY, this.immediateMode, 0); // 2 cycles
    this.operations[0xA4] = new Operation(this.LDY, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xB4] = new Operation(this.LDY, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0xAC] = new Operation(this.LDY, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xBC] = new Operation(this.LDY, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)

    this.operations[0xAB] = new Operation(this.LAX, this.immediateMode, 0); // 2 cycles
    this.operations[0xA7] = new Operation(this.LAX, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xB7] = new Operation(this.LAX, this.zeroPageYMode, 0); // 4 cycles
    this.operations[0xAF] = new Operation(this.LAX, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xBF] = new Operation(this.LAX, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xA3] = new Operation(this.LAX, this.indirectXMode, 0); // 6 cycles
    this.operations[0xB3] = new Operation(this.LAX, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0xBB] = new Operation(this.LAS, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)

    //=========================================================
    // Register transfer instructions
    //=========================================================

    this.operations[0xAA] = new Operation(this.TAX, this.impliedMode, 0); // 2 cycles
    this.operations[0xA8] = new Operation(this.TAY, this.impliedMode, 0); // 2 cycles
    this.operations[0x8A] = new Operation(this.TXA, this.impliedMode, 0); // 2 cycles
    this.operations[0x98] = new Operation(this.TYA, this.impliedMode, 0); // 2 cycles
    this.operations[0x9A] = new Operation(this.TXS, this.impliedMode, 0); // 2 cycles
    this.operations[0xBA] = new Operation(this.TSX, this.impliedMode, 0); // 2 cycles

    //=========================================================
    // Stack push instructions
    //=========================================================

    this.operations[0x48] = new Operation(this.PHA, this.impliedMode, 0); // 3 cycles
    this.operations[0x08] = new Operation(this.PHP, this.impliedMode, 0); // 3 cycles

    //=========================================================
    // Stack pull instructions
    //=========================================================

    this.operations[0x68] = new Operation(this.PLA, this.impliedMode, 0); // 4 cycles
    this.operations[0x28] = new Operation(this.PLP, this.impliedMode, 0); // 4 cycles

    //=========================================================
    // Accumulator bitwise instructions
    //=========================================================

    this.operations[0x29] = new Operation(this.AND, this.immediateMode, 0); // 2 cycles
    this.operations[0x25] = new Operation(this.AND, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x35] = new Operation(this.AND, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x2D] = new Operation(this.AND, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x3D] = new Operation(this.AND, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x39] = new Operation(this.AND, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x21] = new Operation(this.AND, this.indirectXMode, 0); // 6 cycles
    this.operations[0x31] = new Operation(this.AND, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0x09] = new Operation(this.ORA, this.immediateMode, 0); // 2 cycles
    this.operations[0x05] = new Operation(this.ORA, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x15] = new Operation(this.ORA, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x0D] = new Operation(this.ORA, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x1D] = new Operation(this.ORA, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x19] = new Operation(this.ORA, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x01] = new Operation(this.ORA, this.indirectXMode, 0); // 6 cycles
    this.operations[0x11] = new Operation(this.ORA, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0x49] = new Operation(this.EOR, this.immediateMode, 0); // 2 cycles
    this.operations[0x45] = new Operation(this.EOR, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x55] = new Operation(this.EOR, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x4D] = new Operation(this.EOR, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x5D] = new Operation(this.EOR, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x59] = new Operation(this.EOR, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x41] = new Operation(this.EOR, this.indirectXMode, 0); // 6 cycles
    this.operations[0x51] = new Operation(this.EOR, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0x24] = new Operation(this.BIT, this.zeroPageMode, 0); // 3 cycles
    this.operations[0x2C] = new Operation(this.BIT, this.absoluteMode, 0); // 4 cycles

    //=========================================================
    // Increment instructions
    //=========================================================

    this.operations[0xE6] = new Operation(this.INC, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0xF6] = new Operation(this.INC, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0xEE] = new Operation(this.INC, this.absoluteMode, 0);  // 6 cycles
    this.operations[0xFE] = new Operation(this.INC, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    this.operations[0xE8] = new Operation(this.INX, this.impliedMode, 0); // 2 cycles
    this.operations[0xC8] = new Operation(this.INY, this.impliedMode, 0); // 2 cycles

    //=========================================================
    // Decrement instructions
    //=========================================================

    this.operations[0xC6] = new Operation(this.DEC, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0xD6] = new Operation(this.DEC, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0xCE] = new Operation(this.DEC, this.absoluteMode, 0);  // 6 cycles
    this.operations[0xDE] = new Operation(this.DEC, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    this.operations[0xCA] = new Operation(this.DEX, this.impliedMode, 0); // 2 cycles
    this.operations[0x88] = new Operation(this.DEY, this.impliedMode, 0); // 2 cycles

    //=========================================================
    // Comparison instructions
    //=========================================================

    this.operations[0xC9] = new Operation(this.CMP, this.immediateMode, 0); // 2 cycles
    this.operations[0xC5] = new Operation(this.CMP, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xD5] = new Operation(this.CMP, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0xCD] = new Operation(this.CMP, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xDD] = new Operation(this.CMP, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xD9] = new Operation(this.CMP, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xC1] = new Operation(this.CMP, this.indirectXMode, 0); // 6 cycles
    this.operations[0xD1] = new Operation(this.CMP, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0xE0] = new Operation(this.CPX, this.immediateMode, 0); // 2 cycles
    this.operations[0xE4] = new Operation(this.CPX, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xEC] = new Operation(this.CPX, this.absoluteMode, 0);  // 4 cycles

    this.operations[0xC0] = new Operation(this.CPY, this.immediateMode, 0); // 2 cycles
    this.operations[0xC4] = new Operation(this.CPY, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xCC] = new Operation(this.CPY, this.absoluteMode, 0);  // 4 cycles

    //=========================================================
    // Branching instructions
    //=========================================================

    this.operations[0x90] = new Operation(this.BCC, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)
    this.operations[0xB0] = new Operation(this.BCS, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)

    this.operations[0xD0] = new Operation(this.BNE, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)
    this.operations[0xF0] = new Operation(this.BEQ, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)

    this.operations[0x50] = new Operation(this.BVC, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)
    this.operations[0x70] = new Operation(this.BVS, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)

    this.operations[0x10] = new Operation(this.BPL, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)
    this.operations[0x30] = new Operation(this.BMI, this.relativeMode, 0); // 2 cycles (+1 if branch succeeds +2 if to a new page)

    //=========================================================
    // Jump / subroutine instructions
    //=========================================================

    this.operations[0x4C] = new Operation(this.JMP, this.absoluteMode, 0); // 3 cycles
    this.operations[0x6C] = new Operation(this.JMP, this.indirectMode, 0); // 5 cycles
    this.operations[0x20] = new Operation(this.JSR, this.absoluteMode, 0); // 6 cycles
    this.operations[0x60] = new Operation(this.RTS, this.impliedMode, 0);  // 6 cycles

    //=========================================================
    // Interrupt control instructions
    //=========================================================

    this.operations[0x00] = new Operation(this.BRK, this.impliedMode, 0); // 7 cycles
    this.operations[0x40] = new Operation(this.RTI, this.impliedMode, 0); // 6 cycles

    //=========================================================
    // Addition / subtraction instructions
    //=========================================================

    this.operations[0x69] = new Operation(this.ADC, this.immediateMode, 0); // 2 cycles
    this.operations[0x65] = new Operation(this.ADC, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0x75] = new Operation(this.ADC, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0x6D] = new Operation(this.ADC, this.absoluteMode, 0);  // 4 cycles
    this.operations[0x7D] = new Operation(this.ADC, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x79] = new Operation(this.ADC, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0x61] = new Operation(this.ADC, this.indirectXMode, 0); // 6 cycles
    this.operations[0x71] = new Operation(this.ADC, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    this.operations[0xE9] = new Operation(this.SBC, this.immediateMode, 0); // 2 cycles
    this.operations[0xEB] = new Operation(this.SBC, this.immediateMode, 0); // 2 cycles
    this.operations[0xE5] = new Operation(this.SBC, this.zeroPageMode, 0);  // 3 cycles
    this.operations[0xF5] = new Operation(this.SBC, this.zeroPageXMode, 0); // 4 cycles
    this.operations[0xED] = new Operation(this.SBC, this.absoluteMode, 0);  // 4 cycles
    this.operations[0xFD] = new Operation(this.SBC, this.absoluteXMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xF9] = new Operation(this.SBC, this.absoluteYMode, 0); // 4 cycles (+1 if page crossed)
    this.operations[0xE1] = new Operation(this.SBC, this.indirectXMode, 0); // 6 cycles
    this.operations[0xF1] = new Operation(this.SBC, this.indirectYMode, 0); // 5 cycles (+1 if page crossed)

    //=========================================================
    // Shifting / rotation instructions
    //=========================================================

    this.operations[0x0A] = new Operation(this.ASL, this.accumulatorMode, 0); // 2 cycles
    this.operations[0x06] = new Operation(this.ASL, this.zeroPageMode, 0);    // 5 cycles
    this.operations[0x16] = new Operation(this.ASL, this.zeroPageXMode, 0);   // 6 cycles
    this.operations[0x0E] = new Operation(this.ASL, this.absoluteMode, 0);    // 6 cycles
    this.operations[0x1E] = new Operation(this.ASL, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    this.operations[0x4A] = new Operation(this.LSR, this.accumulatorMode, 0); // 2 cycles
    this.operations[0x46] = new Operation(this.LSR, this.zeroPageMode, 0);    // 5 cycles
    this.operations[0x56] = new Operation(this.LSR, this.zeroPageXMode, 0);   // 6 cycles
    this.operations[0x4E] = new Operation(this.LSR, this.absoluteMode, 0);    // 6 cycles
    this.operations[0x5E] = new Operation(this.LSR, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    this.operations[0x2A] = new Operation(this.ROL, this.accumulatorMode, 0); // 2 cycles
    this.operations[0x26] = new Operation(this.ROL, this.zeroPageMode, 0);    // 5 cycles
    this.operations[0x36] = new Operation(this.ROL, this.zeroPageXMode, 0);   // 6 cycles
    this.operations[0x2E] = new Operation(this.ROL, this.absoluteMode, 0);    // 6 cycles
    this.operations[0x3E] = new Operation(this.ROL, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    this.operations[0x6A] = new Operation(this.ROR, this.accumulatorMode, 0); // 2 cycles
    this.operations[0x66] = new Operation(this.ROR, this.zeroPageMode, 0);    // 5 cycles
    this.operations[0x76] = new Operation(this.ROR, this.zeroPageXMode, 0);   // 6 cycles
    this.operations[0x6E] = new Operation(this.ROR, this.absoluteMode, 0);    // 6 cycles
    this.operations[0x7E] = new Operation(this.ROR, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles

    //=========================================================
    // Hybrid instructions
    //=========================================================

    this.operations[0xC7] = new Operation(this.DCP, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0xD7] = new Operation(this.DCP, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0xCF] = new Operation(this.DCP, this.absoluteMode, 0);  // 6 cycles
    this.operations[0xDF] = new Operation(this.DCP, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0xDB] = new Operation(this.DCP, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0xC3] = new Operation(this.DCP, this.indirectXMode, 0); // 8 cycles
    this.operations[0xD3] = new Operation(this.DCP, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0xE7] = new Operation(this.ISB, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0xF7] = new Operation(this.ISB, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0xEF] = new Operation(this.ISB, this.absoluteMode, 0);  // 6 cycles
    this.operations[0xFF] = new Operation(this.ISB, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0xFB] = new Operation(this.ISB, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0xE3] = new Operation(this.ISB, this.indirectXMode, 0); // 8 cycles
    this.operations[0xF3] = new Operation(this.ISB, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0x07] = new Operation(this.SLO, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0x17] = new Operation(this.SLO, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0x0F] = new Operation(this.SLO, this.absoluteMode, 0);  // 6 cycles
    this.operations[0x1F] = new Operation(this.SLO, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x1B] = new Operation(this.SLO, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x03] = new Operation(this.SLO, this.indirectXMode, 0); // 8 cycles
    this.operations[0x13] = new Operation(this.SLO, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0x47] = new Operation(this.SRE, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0x57] = new Operation(this.SRE, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0x4F] = new Operation(this.SRE, this.absoluteMode, 0);  // 6 cycles
    this.operations[0x5F] = new Operation(this.SRE, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x5B] = new Operation(this.SRE, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x43] = new Operation(this.SRE, this.indirectXMode, 0); // 8 cycles
    this.operations[0x53] = new Operation(this.SRE, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0x27] = new Operation(this.RLA, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0x37] = new Operation(this.RLA, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0x2F] = new Operation(this.RLA, this.absoluteMode, 0);  // 6 cycles
    this.operations[0x3F] = new Operation(this.RLA, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x3B] = new Operation(this.RLA, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x23] = new Operation(this.RLA, this.indirectXMode, 0); // 8 cycles
    this.operations[0x33] = new Operation(this.RLA, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0x8B] = new Operation(this.XAA, this.immediateMode, 0); // 2 cycles

    this.operations[0x67] = new Operation(this.RRA, this.zeroPageMode, 0);  // 5 cycles
    this.operations[0x77] = new Operation(this.RRA, this.zeroPageXMode, 0); // 6 cycles
    this.operations[0x6F] = new Operation(this.RRA, this.absoluteMode, 0);  // 6 cycles
    this.operations[0x7F] = new Operation(this.RRA, this.absoluteXMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x7B] = new Operation(this.RRA, this.absoluteYMode, F_DOUBLE_READ); // 7 cycles
    this.operations[0x63] = new Operation(this.RRA, this.indirectXMode, 0); // 8 cycles
    this.operations[0x73] = new Operation(this.RRA, this.indirectYMode, F_DOUBLE_READ); // 8 cycles

    this.operations[0xCB] = new Operation(this.AXS, this.immediateMode, 0); // 2 cycles

    this.operations[0x0B] = new Operation(this.ANC, this.immediateMode, 0); // 2 cycles
    this.operations[0x2B] = new Operation(this.ANC, this.immediateMode, 0); // 2 cycles

    this.operations[0x4B] = new Operation(this.ALR, this.immediateMode, 0); // 2 cycles
    this.operations[0x6B] = new Operation(this.ARR, this.immediateMode, 0); // 2 cycles

    this.operations[0x9B] = new Operation(this.TAS, this.absoluteYMode, F_DOUBLE_READ); // 5 cycles
  }

}
