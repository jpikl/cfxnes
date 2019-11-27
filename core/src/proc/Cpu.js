import {log} from '../common';
import Bus from '../common/Bus'; // eslint-disable-line no-unused-vars
import CpuInterface from './CpuInterface'; // eslint-disable-line no-unused-vars
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

/**
 * @implements {CpuInterface}
 */
export default class Cpu {

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

  /**
   * Connects CPU to bus.
   * @param {!Bus} bus Bus.
   * @override
   */
  connect(bus) {
    log.info('Connecting CPU');
    this.cpuMemory = bus.getCpuMemory();
    this.ppu = bus.getPpu();
    this.apu = bus.getApu();
    this.dma = bus.getDma();
  }

  /**
   * Disconnects CPU from bus.
   * @override
   */
  disconnect() {
    log.info('Connecting CPU');
    this.cpuMemory = null;
    this.ppu = null;
    this.apu = null;
    this.dma = null;
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
    const blocked = this.dma.isBlockingCpu() || this.apu.isBlockingCpu();
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
      this.handleNmi();
    } else if (this.irqDisabled) {
      return; // IRQ requested, but disabled
    } else {
      this.handleIrq();
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

  handleNmi() {
    this.saveStateBeforeInterrupt();
    this.enterInterruptHandler(NMI_ADDRESS);
    this.clearInterrupt(NMI);
  }

  handleIrq() {
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
    if (!this.apu.isBlockingDma()) {
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

  nop() {
    if (this.operationFlags & F_EXTRA_CYCLE) {
      this.tick();
    }
  }

  //=========================================================
  // Clear flag instructions
  //=========================================================

  clc() {
    this.carryFlag = 0;
  }

  cli() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 0;
  }

  cld() {
    this.decimalFlag = 0;
  }

  clv() {
    this.overflowFlag = 0;
  }

  //=========================================================
  // Set flag instructions
  //=========================================================

  sec() {
    this.carryFlag = 1;
  }

  sei() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 1;
  }

  sed() {
    this.decimalFlag = 1;
  }

  //=========================================================
  // Memory write instructions
  //=========================================================

  sta(address) {
    this.writeByte(address, this.accumulator);
  }

  stx(address) {
    this.writeByte(address, this.registerX);
  }

  sax(address) {
    this.writeByte(address, this.accumulator & this.registerX);
  }

  sty(address) {
    this.writeByte(address, this.registerY);
  }

  sha(address) { // Also known as AHX
    this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
  }

  shx(address) { // Also known as SXA
    this.storeHighAddressIntoMemory(address, this.registerX);
  }

  shy(address) { // Also known as SYA
    this.storeHighAddressIntoMemory(address, this.registerY);
  }

  //=========================================================
  // Memory read instructions
  //=========================================================

  lda(address) {
    this.storeValueIntoAccumulator(this.readByte(address));
  }

  ldx(address) {
    this.storeValueIntoRegisterX(this.readByte(address));
  }

  ldy(address) {
    this.storeValueIntoRegisterY(this.readByte(address));
  }

  lax(address) {
    const value = this.readByte(address);
    this.storeValueIntoAccumulator(value);
    this.storeValueIntoRegisterX(value);
  }

  las(address) {
    this.stackPointer &= this.readByte(address);
    this.storeValueIntoAccumulator(this.stackPointer);
    this.storeValueIntoRegisterX(this.stackPointer);
  }

  //=========================================================
  // Register transfer instructions
  //=========================================================

  tax() {
    this.storeValueIntoRegisterX(this.accumulator);
  }

  tay() {
    this.storeValueIntoRegisterY(this.accumulator);
  }

  txa() {
    this.storeValueIntoAccumulator(this.registerX);
  }

  tya() {
    this.storeValueIntoAccumulator(this.registerY);
  }

  tsx() {
    this.storeValueIntoRegisterX(this.stackPointer);
  }

  txs() {
    this.stackPointer = this.registerX;
  }

  //=========================================================
  // Stack push instructions
  //=========================================================

  pha() {
    this.pushByte(this.accumulator);
  }

  php() {
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
  }

  //=========================================================
  // Stack pull instructions
  //=========================================================

  pla() {
    this.tick();
    this.storeValueIntoAccumulator(this.popByte());
  }

  plp() {
    this.tick();
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.setStatus(this.popByte());
  }

  //=========================================================
  // Accumulator bitwise instructions
  //=========================================================

  and(address) {
    return this.storeValueIntoAccumulator(this.accumulator & this.readByte(address));
  }

  ora(address) {
    this.storeValueIntoAccumulator(this.accumulator | this.readByte(address));
  }

  eor(address) {
    this.storeValueIntoAccumulator(this.accumulator ^ this.readByte(address));
  }

  bit(address) {
    const value = this.readByte(address);
    this.zeroFlag = (!(this.accumulator & value)) | 0;
    this.overflowFlag = (value >>> 6) & 1;
    this.negativeFlag = value >>> 7;
  }

  //=========================================================
  // Increment instructions
  //=========================================================

  inc(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) + 1) & 0xFF);
  }

  inx() {
    this.storeValueIntoRegisterX((this.registerX + 1) & 0xFF);
  }

  iny() {
    this.storeValueIntoRegisterY((this.registerY + 1) & 0xFF);
  }

  //=========================================================
  // Decrement instructions
  //=========================================================

  dec(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) - 1) & 0xFF);
  }

  dex() {
    this.storeValueIntoRegisterX((this.registerX - 1) & 0xFF);
  }

  dey() {
    this.storeValueIntoRegisterY((this.registerY - 1) & 0xFF);
  }

  //=========================================================
  // Comparison instructions
  //=========================================================

  cmp(address) {
    this.compareRegisterAndMemory(this.accumulator, address);
  }

  cpx(address) {
    this.compareRegisterAndMemory(this.registerX, address);
  }

  cpy(address) {
    this.compareRegisterAndMemory(this.registerY, address);
  }

  //=========================================================
  // Branching instructions
  //=========================================================

  bcc(address) {
    this.branchIf(!this.carryFlag, address);
  }

  bcs(address) {
    this.branchIf(this.carryFlag, address);
  }

  bne(address) {
    this.branchIf(!this.zeroFlag, address);
  }

  beq(address) {
    this.branchIf(this.zeroFlag, address);
  }

  bvc(address) {
    this.branchIf(!this.overflowFlag, address);
  }

  bvs(address) {
    this.branchIf(this.overflowFlag, address);
  }

  bpl(address) {
    this.branchIf(!this.negativeFlag, address);
  }

  bmi(address) {
    this.branchIf(this.negativeFlag, address);
  }

  //=========================================================
  // Jump / subroutine instructions
  //=========================================================

  jmp(address) {
    this.programCounter = address;
  }

  jsr(address) {
    this.tick();
    this.pushWord((this.programCounter - 1) & 0xFFFF); // The pushed address must be the end of the current instruction
    this.programCounter = address;
  }

  rts() {
    this.tick();
    this.tick();
    this.programCounter = (this.popWord() + 1) & 0xFFFF; // We decremented the address when pushing it during JSR
  }

  //=========================================================
  // Interrupt control instructions
  //=========================================================

  brk() {
    this.moveProgramCounter(1);  // BRK is 2 byte instruction (skip the unused byte)
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
    this.irqDisabled = 1;   // Immediate change to IRQ disablement
    this.interruptFlag = 1; // Immediate change to IRQ disablement
    this.programCounter = this.readWord(this.activeInterrupts & NMI ? NMI_ADDRESS : IRQ_ADDRESS); // Active NMI hijacks BRK
  }

  rti() {
    this.tick();
    this.setStatus(this.popByte());
    this.irqDisabled = this.interruptFlag; // Immediate change to IRQ disablement
    this.programCounter = this.popWord();
  }

  //=========================================================
  // Addition / subtraction instructions
  //=========================================================

  adc(address) {
    this.addValueToAccumulator(this.readByte(address));
  }

  sbc(address) {
    this.addValueToAccumulator((this.readByte(address)) ^ 0xFF); // With internal carry increment makes negative operand
  }

  //=========================================================
  // Shifting / rotation instructions
  //=========================================================

  asl(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateLeft, false);
  }

  lsr(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateRight, false);
  }

  rol(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateLeft, true);
  }

  ror(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateRight, true);
  }

  //=========================================================
  // Hybrid instructions
  //=========================================================

  dcp(address) {
    this.compareRegisterAndOperand(this.accumulator, this.dec(address));
  }

  isb(address) {
    this.addValueToAccumulator((this.inc(address)) ^ 0xFF); // With internal carry increment makes negative operand
  }

  slo(address) {
    this.storeValueIntoAccumulator(this.accumulator | this.asl(address));
  }

  sre(address) {
    this.storeValueIntoAccumulator(this.accumulator ^ this.lsr(address));
  }

  rla(address) {
    this.storeValueIntoAccumulator(this.accumulator & this.rol(address));
  }

  xaa(address) { // Also known as ANE
    this.storeValueIntoAccumulator(this.registerX & this.and(address));
  }

  rra(address) {
    this.addValueToAccumulator(this.ror(address));
  }

  axs(address) { // Also known as SBX
    this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
  }

  anc(address) {
    this.rotateLeft(this.and(address), false); // rotateLeft computes carry
  }

  alr(address) {
    this.and(address);
    this.lsr(null);
  }

  arr(address) {
    this.and(address);
    this.ror(null);
    this.carryFlag = (this.accumulator >>> 6) & 1;
    this.overflowFlag = ((this.accumulator >>> 5) & 1) ^ this.carryFlag;
  }

  tas(address) { // Also known as SHS
    this.stackPointer = this.accumulator & this.registerX;
    this.sha(address);
  }

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

const proto = Cpu.prototype;

//=========================================================
// No operation instruction
//=========================================================

operations[0x1A] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0x3A] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0x5A] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0x7A] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0xDA] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0xEA] = [proto.nop, proto.impliedMode, 0]; // 2 cycles
operations[0xFA] = [proto.nop, proto.impliedMode, 0]; // 2 cycles

operations[0x80] = [proto.nop, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0x82] = [proto.nop, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0x89] = [proto.nop, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0xC2] = [proto.nop, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles
operations[0xE2] = [proto.nop, proto.immediateMode, F_EXTRA_CYCLE]; // 2 cycles

operations[0x04] = [proto.nop, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles
operations[0x44] = [proto.nop, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles
operations[0x64] = [proto.nop, proto.zeroPageMode, F_EXTRA_CYCLE]; // 3 cycles

operations[0x14] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x34] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x54] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0x74] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0xD4] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles
operations[0xF4] = [proto.nop, proto.zeroPageXMode, F_EXTRA_CYCLE]; // 4 cycles

operations[0x0C] = [proto.nop, proto.absoluteMode, F_EXTRA_CYCLE]; // 4 cycles

operations[0x1C] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x3C] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x5C] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0x7C] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0xDC] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)
operations[0xFC] = [proto.nop, proto.absoluteXMode, F_EXTRA_CYCLE]; // 4 cycles (+1 if page crossed)

//=========================================================
// Clear flag instructions
//=========================================================

operations[0x18] = [proto.clc, proto.impliedMode, 0]; // 2 cycles
operations[0x58] = [proto.cli, proto.impliedMode, 0]; // 2 cycles
operations[0xD8] = [proto.cld, proto.impliedMode, 0]; // 2 cycles
operations[0xB8] = [proto.clv, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Set flag instructions
//=========================================================

operations[0x38] = [proto.sec, proto.impliedMode, 0]; // 2 cycles
operations[0x78] = [proto.sei, proto.impliedMode, 0]; // 2 cycles
operations[0xF8] = [proto.sed, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Memory write instructions
//=========================================================

operations[0x85] = [proto.sta, proto.zeroPageMode, 0];  // 3 cycles
operations[0x95] = [proto.sta, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x8D] = [proto.sta, proto.absoluteMode, 0];  // 4 cycles
operations[0x9D] = [proto.sta, proto.absoluteXMode, F_DOUBLE_READ]; // 5 cycles
operations[0x99] = [proto.sta, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x81] = [proto.sta, proto.indirectXMode, 0]; // 6 cycles
operations[0x91] = [proto.sta, proto.indirectYMode, F_DOUBLE_READ]; // 6 cycles

operations[0x86] = [proto.stx, proto.zeroPageMode, 0];  // 3 cycles
operations[0x96] = [proto.stx, proto.zeroPageYMode, 0]; // 4 cycles
operations[0x8E] = [proto.stx, proto.absoluteMode, 0];  // 4 cycles

operations[0x87] = [proto.sax, proto.zeroPageMode, 0];  // 3 cycles
operations[0x97] = [proto.sax, proto.zeroPageYMode, 0]; // 4 cycles
operations[0x8F] = [proto.sax, proto.absoluteMode, 0];  // 4 cycles
operations[0x83] = [proto.sax, proto.indirectXMode, 0]; // 6 cycles

operations[0x84] = [proto.sty, proto.zeroPageMode, 0];  // 3 cycles
operations[0x94] = [proto.sty, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x8C] = [proto.sty, proto.absoluteMode, 0];  // 4 cycles

operations[0x93] = [proto.sha, proto.indirectYMode, F_DOUBLE_READ]; // 6 cycles
operations[0x9F] = [proto.sha, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x9E] = [proto.shx, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
operations[0x9C] = [proto.shy, proto.absoluteXMode, F_DOUBLE_READ]; // 5 cycles

//=========================================================
// Memory read instructions
//=========================================================

operations[0xA9] = [proto.lda, proto.immediateMode, 0]; // 2 cycles
operations[0xA5] = [proto.lda, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB5] = [proto.lda, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xAD] = [proto.lda, proto.absoluteMode, 0];  // 4 cycles
operations[0xBD] = [proto.lda, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xB9] = [proto.lda, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xA1] = [proto.lda, proto.indirectXMode, 0]; // 6 cycles
operations[0xB1] = [proto.lda, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xA2] = [proto.ldx, proto.immediateMode, 0]; // 2 cycles
operations[0xA6] = [proto.ldx, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB6] = [proto.ldx, proto.zeroPageYMode, 0]; // 4 cycles
operations[0xAE] = [proto.ldx, proto.absoluteMode, 0];  // 4 cycles
operations[0xBE] = [proto.ldx, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)

operations[0xA0] = [proto.ldy, proto.immediateMode, 0]; // 2 cycles
operations[0xA4] = [proto.ldy, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB4] = [proto.ldy, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xAC] = [proto.ldy, proto.absoluteMode, 0];  // 4 cycles
operations[0xBC] = [proto.ldy, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)

operations[0xAB] = [proto.lax, proto.immediateMode, 0]; // 2 cycles
operations[0xA7] = [proto.lax, proto.zeroPageMode, 0];  // 3 cycles
operations[0xB7] = [proto.lax, proto.zeroPageYMode, 0]; // 4 cycles
operations[0xAF] = [proto.lax, proto.absoluteMode, 0];  // 4 cycles
operations[0xBF] = [proto.lax, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xA3] = [proto.lax, proto.indirectXMode, 0]; // 6 cycles
operations[0xB3] = [proto.lax, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xBB] = [proto.las, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)

//=========================================================
// Register transfer instructions
//=========================================================

operations[0xAA] = [proto.tax, proto.impliedMode, 0]; // 2 cycles
operations[0xA8] = [proto.tay, proto.impliedMode, 0]; // 2 cycles
operations[0x8A] = [proto.txa, proto.impliedMode, 0]; // 2 cycles
operations[0x98] = [proto.tya, proto.impliedMode, 0]; // 2 cycles
operations[0x9A] = [proto.txs, proto.impliedMode, 0]; // 2 cycles
operations[0xBA] = [proto.tsx, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Stack push instructions
//=========================================================

operations[0x48] = [proto.pha, proto.impliedMode, 0]; // 3 cycles
operations[0x08] = [proto.php, proto.impliedMode, 0]; // 3 cycles

//=========================================================
// Stack pull instructions
//=========================================================

operations[0x68] = [proto.pla, proto.impliedMode, 0]; // 4 cycles
operations[0x28] = [proto.plp, proto.impliedMode, 0]; // 4 cycles

//=========================================================
// Accumulator bitwise instructions
//=========================================================

operations[0x29] = [proto.and, proto.immediateMode, 0]; // 2 cycles
operations[0x25] = [proto.and, proto.zeroPageMode, 0];  // 3 cycles
operations[0x35] = [proto.and, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x2D] = [proto.and, proto.absoluteMode, 0];  // 4 cycles
operations[0x3D] = [proto.and, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x39] = [proto.and, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x21] = [proto.and, proto.indirectXMode, 0]; // 6 cycles
operations[0x31] = [proto.and, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x09] = [proto.ora, proto.immediateMode, 0]; // 2 cycles
operations[0x05] = [proto.ora, proto.zeroPageMode, 0];  // 3 cycles
operations[0x15] = [proto.ora, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x0D] = [proto.ora, proto.absoluteMode, 0];  // 4 cycles
operations[0x1D] = [proto.ora, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x19] = [proto.ora, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x01] = [proto.ora, proto.indirectXMode, 0]; // 6 cycles
operations[0x11] = [proto.ora, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x49] = [proto.eor, proto.immediateMode, 0]; // 2 cycles
operations[0x45] = [proto.eor, proto.zeroPageMode, 0];  // 3 cycles
operations[0x55] = [proto.eor, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x4D] = [proto.eor, proto.absoluteMode, 0];  // 4 cycles
operations[0x5D] = [proto.eor, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x59] = [proto.eor, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x41] = [proto.eor, proto.indirectXMode, 0]; // 6 cycles
operations[0x51] = [proto.eor, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0x24] = [proto.bit, proto.zeroPageMode, 0]; // 3 cycles
operations[0x2C] = [proto.bit, proto.absoluteMode, 0]; // 4 cycles

//=========================================================
// Increment instructions
//=========================================================

operations[0xE6] = [proto.inc, proto.zeroPageMode, 0];  // 5 cycles
operations[0xF6] = [proto.inc, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xEE] = [proto.inc, proto.absoluteMode, 0];  // 6 cycles
operations[0xFE] = [proto.inc, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0xE8] = [proto.inx, proto.impliedMode, 0]; // 2 cycles
operations[0xC8] = [proto.iny, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Decrement instructions
//=========================================================

operations[0xC6] = [proto.dec, proto.zeroPageMode, 0];  // 5 cycles
operations[0xD6] = [proto.dec, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xCE] = [proto.dec, proto.absoluteMode, 0];  // 6 cycles
operations[0xDE] = [proto.dec, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0xCA] = [proto.dex, proto.impliedMode, 0]; // 2 cycles
operations[0x88] = [proto.dey, proto.impliedMode, 0]; // 2 cycles

//=========================================================
// Comparison instructions
//=========================================================

operations[0xC9] = [proto.cmp, proto.immediateMode, 0]; // 2 cycles
operations[0xC5] = [proto.cmp, proto.zeroPageMode, 0];  // 3 cycles
operations[0xD5] = [proto.cmp, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xCD] = [proto.cmp, proto.absoluteMode, 0];  // 4 cycles
operations[0xDD] = [proto.cmp, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xD9] = [proto.cmp, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xC1] = [proto.cmp, proto.indirectXMode, 0]; // 6 cycles
operations[0xD1] = [proto.cmp, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xE0] = [proto.cpx, proto.immediateMode, 0]; // 2 cycles
operations[0xE4] = [proto.cpx, proto.zeroPageMode, 0];  // 3 cycles
operations[0xEC] = [proto.cpx, proto.absoluteMode, 0];  // 4 cycles

operations[0xC0] = [proto.cpy, proto.immediateMode, 0]; // 2 cycles
operations[0xC4] = [proto.cpy, proto.zeroPageMode, 0];  // 3 cycles
operations[0xCC] = [proto.cpy, proto.absoluteMode, 0];  // 4 cycles

//=========================================================
// Branching instructions
//=========================================================

operations[0x90] = [proto.bcc, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0xB0] = [proto.bcs, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0xD0] = [proto.bne, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0xF0] = [proto.beq, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0x50] = [proto.bvc, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0x70] = [proto.bvs, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

operations[0x10] = [proto.bpl, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)
operations[0x30] = [proto.bmi, proto.relativeMode, 0]; // 2 cycles (+1 if branch succeeds +2 if to a new page)

//=========================================================
// Jump / subroutine instructions
//=========================================================

operations[0x4C] = [proto.jmp, proto.absoluteMode, 0]; // 3 cycles
operations[0x6C] = [proto.jmp, proto.indirectMode, 0]; // 5 cycles
operations[0x20] = [proto.jsr, proto.absoluteMode, 0]; // 6 cycles
operations[0x60] = [proto.rts, proto.impliedMode, 0];  // 6 cycles

//=========================================================
// Interrupt control instructions
//=========================================================

operations[0x00] = [proto.brk, proto.impliedMode, 0]; // 7 cycles
operations[0x40] = [proto.rti, proto.impliedMode, 0]; // 6 cycles

//=========================================================
// Addition / subtraction instructions
//=========================================================

operations[0x69] = [proto.adc, proto.immediateMode, 0]; // 2 cycles
operations[0x65] = [proto.adc, proto.zeroPageMode, 0];  // 3 cycles
operations[0x75] = [proto.adc, proto.zeroPageXMode, 0]; // 4 cycles
operations[0x6D] = [proto.adc, proto.absoluteMode, 0];  // 4 cycles
operations[0x7D] = [proto.adc, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x79] = [proto.adc, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0x61] = [proto.adc, proto.indirectXMode, 0]; // 6 cycles
operations[0x71] = [proto.adc, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

operations[0xE9] = [proto.sbc, proto.immediateMode, 0]; // 2 cycles
operations[0xEB] = [proto.sbc, proto.immediateMode, 0]; // 2 cycles
operations[0xE5] = [proto.sbc, proto.zeroPageMode, 0];  // 3 cycles
operations[0xF5] = [proto.sbc, proto.zeroPageXMode, 0]; // 4 cycles
operations[0xED] = [proto.sbc, proto.absoluteMode, 0];  // 4 cycles
operations[0xFD] = [proto.sbc, proto.absoluteXMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xF9] = [proto.sbc, proto.absoluteYMode, 0]; // 4 cycles (+1 if page crossed)
operations[0xE1] = [proto.sbc, proto.indirectXMode, 0]; // 6 cycles
operations[0xF1] = [proto.sbc, proto.indirectYMode, 0]; // 5 cycles (+1 if page crossed)

//=========================================================
// Shifting / rotation instructions
//=========================================================

operations[0x0A] = [proto.asl, proto.accumulatorMode, 0]; // 2 cycles
operations[0x06] = [proto.asl, proto.zeroPageMode, 0];    // 5 cycles
operations[0x16] = [proto.asl, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x0E] = [proto.asl, proto.absoluteMode, 0];    // 6 cycles
operations[0x1E] = [proto.asl, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x4A] = [proto.lsr, proto.accumulatorMode, 0]; // 2 cycles
operations[0x46] = [proto.lsr, proto.zeroPageMode, 0];    // 5 cycles
operations[0x56] = [proto.lsr, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x4E] = [proto.lsr, proto.absoluteMode, 0];    // 6 cycles
operations[0x5E] = [proto.lsr, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x2A] = [proto.rol, proto.accumulatorMode, 0]; // 2 cycles
operations[0x26] = [proto.rol, proto.zeroPageMode, 0];    // 5 cycles
operations[0x36] = [proto.rol, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x2E] = [proto.rol, proto.absoluteMode, 0];    // 6 cycles
operations[0x3E] = [proto.rol, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

operations[0x6A] = [proto.ror, proto.accumulatorMode, 0]; // 2 cycles
operations[0x66] = [proto.ror, proto.zeroPageMode, 0];    // 5 cycles
operations[0x76] = [proto.ror, proto.zeroPageXMode, 0];   // 6 cycles
operations[0x6E] = [proto.ror, proto.absoluteMode, 0];    // 6 cycles
operations[0x7E] = [proto.ror, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles

//=========================================================
// Hybrid instructions
//=========================================================

operations[0xC7] = [proto.dcp, proto.zeroPageMode, 0];  // 5 cycles
operations[0xD7] = [proto.dcp, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xCF] = [proto.dcp, proto.absoluteMode, 0];  // 6 cycles
operations[0xDF] = [proto.dcp, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0xDB] = [proto.dcp, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0xC3] = [proto.dcp, proto.indirectXMode, 0]; // 8 cycles
operations[0xD3] = [proto.dcp, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0xE7] = [proto.isb, proto.zeroPageMode, 0];  // 5 cycles
operations[0xF7] = [proto.isb, proto.zeroPageXMode, 0]; // 6 cycles
operations[0xEF] = [proto.isb, proto.absoluteMode, 0];  // 6 cycles
operations[0xFF] = [proto.isb, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0xFB] = [proto.isb, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0xE3] = [proto.isb, proto.indirectXMode, 0]; // 8 cycles
operations[0xF3] = [proto.isb, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x07] = [proto.slo, proto.zeroPageMode, 0];  // 5 cycles
operations[0x17] = [proto.slo, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x0F] = [proto.slo, proto.absoluteMode, 0];  // 6 cycles
operations[0x1F] = [proto.slo, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x1B] = [proto.slo, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x03] = [proto.slo, proto.indirectXMode, 0]; // 8 cycles
operations[0x13] = [proto.slo, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x47] = [proto.sre, proto.zeroPageMode, 0];  // 5 cycles
operations[0x57] = [proto.sre, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x4F] = [proto.sre, proto.absoluteMode, 0];  // 6 cycles
operations[0x5F] = [proto.sre, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x5B] = [proto.sre, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x43] = [proto.sre, proto.indirectXMode, 0]; // 8 cycles
operations[0x53] = [proto.sre, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x27] = [proto.rla, proto.zeroPageMode, 0];  // 5 cycles
operations[0x37] = [proto.rla, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x2F] = [proto.rla, proto.absoluteMode, 0];  // 6 cycles
operations[0x3F] = [proto.rla, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x3B] = [proto.rla, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x23] = [proto.rla, proto.indirectXMode, 0]; // 8 cycles
operations[0x33] = [proto.rla, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0x8B] = [proto.xaa, proto.immediateMode, 0]; // 2 cycles

operations[0x67] = [proto.rra, proto.zeroPageMode, 0];  // 5 cycles
operations[0x77] = [proto.rra, proto.zeroPageXMode, 0]; // 6 cycles
operations[0x6F] = [proto.rra, proto.absoluteMode, 0];  // 6 cycles
operations[0x7F] = [proto.rra, proto.absoluteXMode, F_DOUBLE_READ]; // 7 cycles
operations[0x7B] = [proto.rra, proto.absoluteYMode, F_DOUBLE_READ]; // 7 cycles
operations[0x63] = [proto.rra, proto.indirectXMode, 0]; // 8 cycles
operations[0x73] = [proto.rra, proto.indirectYMode, F_DOUBLE_READ]; // 8 cycles

operations[0xCB] = [proto.axs, proto.immediateMode, 0]; // 2 cycles

operations[0x0B] = [proto.anc, proto.immediateMode, 0]; // 2 cycles
operations[0x2B] = [proto.anc, proto.immediateMode, 0]; // 2 cycles

operations[0x4B] = [proto.alr, proto.immediateMode, 0]; // 2 cycles
operations[0x6B] = [proto.arr, proto.immediateMode, 0]; // 2 cycles

operations[0x9B] = [proto.tas, proto.absoluteYMode, F_DOUBLE_READ]; // 5 cycles
