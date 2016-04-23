import CPU from '../units/CPU';
import {Logger} from '../utils/logger';
import {byteAsHex, wordAsHex, fillLeft} from '../utils/format';

//=========================================================
// CPU with debugging printouts
//=========================================================

export default class LoggingCPU extends CPU {

  constructor() {
    super();
    this.basicLogger = new Logger;
    this.verboseLogger = new Logger;
    this.stateAfterOperation = true;
  }

  //=========================================================
  // Program execution
  //=========================================================

  handleReset() {
    super.handleReset();
    this.startLogging();
    if (this.stateAfterOperation) {
      this.recordState();
      this.printLine();
    }
  }

  executeOperation() {
    if (!this.stateAfterOperation) {
      this.recordState();
    }
    this.recordOperationBefore();
    super.executeOperation();
    this.recordOperationAfter();
    if (this.stateAfterOperation) {
      this.recordState();
    }
    this.printLine();
  }

  //=========================================================
  // Addressing modes
  //=========================================================

  impliedMode()     { return this.recordAddressingMode('imp', super.impliedMode());     }
  accumulatorMode() { return this.recordAddressingMode('acc', super.accumulatorMode()); }
  immediateMode()   { return this.recordAddressingMode('imm', super.immediateMode());   }
  zeroPageMode()    { return this.recordAddressingMode('zpg', super.zeroPageMode());    }
  zeroPageXMode()   { return this.recordAddressingMode('zpx', super.zeroPageXMode());   }
  zeroPageYMode()   { return this.recordAddressingMode('zpy', super.zeroPageYMode());   }
  absoluteMode()    { return this.recordAddressingMode('abs', super.absoluteMode());    }
  absoluteXMode()   { return this.recordAddressingMode('abx', super.absoluteXMode());   }
  absoluteYMode()   { return this.recordAddressingMode('aby', super.absoluteYMode());   }
  relativeMode()    { return this.recordAddressingMode('abx', super.relativeMode());    }
  indirectMode()    { return this.recordAddressingMode('ind', super.indirectMode());    }
  indirectXMode()   { return this.recordAddressingMode('inx', super.indirectXMode());   }
  indirectYMode()   { return this.recordAddressingMode('iny', super.indirectYMode());   }

  //=========================================================
  // Instructions
  //=========================================================

  NOP(address) { return this.recordInstruction('NOP', super.NOP(address)); }
  CLC(address) { return this.recordInstruction('CLC', super.CLC(address)); }
  CLI(address) { return this.recordInstruction('CLI', super.CLI(address)); }
  CLD(address) { return this.recordInstruction('CLD', super.CLD(address)); }
  CLV(address) { return this.recordInstruction('CLV', super.CLV(address)); }
  SEC(address) { return this.recordInstruction('SEC', super.SEC(address)); }
  SEI(address) { return this.recordInstruction('SEI', super.SEI(address)); }
  SED(address) { return this.recordInstruction('SED', super.SED(address)); }
  STA(address) { return this.recordInstruction('STA', super.STA(address)); }
  STX(address) { return this.recordInstruction('STX', super.STX(address)); }
  SAX(address) { return this.recordInstruction('SAX', super.SAX(address)); }
  STY(address) { return this.recordInstruction('STY', super.STY(address)); }
  SHX(address) { return this.recordInstruction('SHX', super.SHX(address)); }
  SHY(address) { return this.recordInstruction('SHY', super.SHY(address)); }
  LDA(address) { return this.recordInstruction('LDA', super.LDA(address)); }
  LDX(address) { return this.recordInstruction('LDX', super.LDX(address)); }
  LDY(address) { return this.recordInstruction('LDY', super.LDY(address)); }
  LAX(address) { return this.recordInstruction('LAX', super.LAX(address)); }
  LAS(address) { return this.recordInstruction('LAS', super.LAS(address)); }
  TAX(address) { return this.recordInstruction('TAX', super.TAX(address)); }
  TAY(address) { return this.recordInstruction('TAY', super.TAY(address)); }
  TXA(address) { return this.recordInstruction('TXA', super.TXA(address)); }
  TYA(address) { return this.recordInstruction('TYA', super.TYA(address)); }
  TSX(address) { return this.recordInstruction('TSX', super.TSX(address)); }
  TXS(address) { return this.recordInstruction('TXS', super.TXS(address)); }
  PHA(address) { return this.recordInstruction('PHA', super.PHA(address)); }
  PHP(address) { return this.recordInstruction('PHP', super.PHP(address)); }
  PLA(address) { return this.recordInstruction('PLA', super.PLA(address)); }
  PLP(address) { return this.recordInstruction('PLP', super.PLP(address)); }
  AND(address) { return this.recordInstruction('AND', super.AND(address)); }
  ORA(address) { return this.recordInstruction('ORA', super.ORA(address)); }
  EOR(address) { return this.recordInstruction('EOR', super.EOR(address)); }
  BIT(address) { return this.recordInstruction('BIT', super.BIT(address)); }
  INC(address) { return this.recordInstruction('INC', super.INC(address)); }
  INX(address) { return this.recordInstruction('INX', super.INX(address)); }
  INY(address) { return this.recordInstruction('INY', super.INY(address)); }
  DEC(address) { return this.recordInstruction('DEC', super.DEC(address)); }
  DEX(address) { return this.recordInstruction('DEX', super.DEX(address)); }
  DEY(address) { return this.recordInstruction('DEY', super.DEY(address)); }
  CMP(address) { return this.recordInstruction('CMP', super.CMP(address)); }
  CPX(address) { return this.recordInstruction('CPX', super.CPX(address)); }
  CPY(address) { return this.recordInstruction('CPY', super.CPY(address)); }
  BCC(address) { return this.recordInstruction('BCC', super.BCC(address)); }
  BCS(address) { return this.recordInstruction('BCS', super.BCS(address)); }
  BNE(address) { return this.recordInstruction('BNE', super.BNE(address)); }
  BEQ(address) { return this.recordInstruction('BEQ', super.BEQ(address)); }
  BVC(address) { return this.recordInstruction('BVC', super.BVC(address)); }
  BVS(address) { return this.recordInstruction('BVS', super.BVS(address)); }
  BPL(address) { return this.recordInstruction('BPL', super.BPL(address)); }
  BMI(address) { return this.recordInstruction('BMI', super.BMI(address)); }
  JMP(address) { return this.recordInstruction('JMP', super.JMP(address)); }
  JSR(address) { return this.recordInstruction('JSR', super.JSR(address)); }
  RTS(address) { return this.recordInstruction('RTS', super.RTS(address)); }
  BRK(address) { return this.recordInstruction('BRK', super.BRK(address)); }
  RTI(address) { return this.recordInstruction('RTI', super.RTI(address)); }
  ADC(address) { return this.recordInstruction('ADC', super.ADC(address)); }
  SBC(address) { return this.recordInstruction('SBC', super.SBC(address)); }
  ASL(address) { return this.recordInstruction('ASL', super.ASL(address)); }
  LSR(address) { return this.recordInstruction('LSR', super.LSR(address)); }
  ROL(address) { return this.recordInstruction('ROL', super.ROL(address)); }
  ROR(address) { return this.recordInstruction('ROR', super.ROR(address)); }
  DCP(address) { return this.recordInstruction('DCP', super.DCP(address)); }
  ISB(address) { return this.recordInstruction('ISB', super.ISB(address)); }
  SLO(address) { return this.recordInstruction('SLO', super.SLO(address)); }
  SRE(address) { return this.recordInstruction('SRE', super.SRE(address)); }
  RLA(address) { return this.recordInstruction('RLA', super.RLA(address)); }
  XAA(address) { return this.recordInstruction('XAA', super.XAA(address)); }
  RRA(address) { return this.recordInstruction('RRA', super.RRA(address)); }
  AXS(address) { return this.recordInstruction('AXS', super.AXS(address)); }
  ANC(address) { return this.recordInstruction('ANC', super.ANC(address)); }
  ALR(address) { return this.recordInstruction('ALR', super.ALR(address)); }
  ARR(address) { return this.recordInstruction('ARR', super.ARR(address)); }
  TAS(address) { return this.recordInstruction('TAS', super.TAS(address)); }

  //=========================================================
  // Logging
  //=========================================================

  startLogging() {
    this.line = 0;
    this.printHeader();
    this.basicFormatters = [
      this.formatProgramCounter,
      this.formatInstructionData,
      this.formatInstructionCode,
      this.formatRegisters,
    ];
    this.verboseFormatters = [
      this.formatLine,
      this.formatCycle,
      this.formatProgramCounter,
      this.formatInstructionData,
      this.formatInstructionCode,
      this.formatInstructionCycles,
      this.formatAddressingMode,
      this.formatAddressingDetails,
      this.formatRegisters,
      this.formatFlags,
    ];
  }

  stopLogging() {
    this.basicLogger.close();
    this.verboseLogger.close();
  }

  printHeader() {
    this.verboseLogger.info('/-------+-------+------+----------+-----+---+-----+------------+---------------------------+-----------------\\');
    this.verboseLogger.info('|     # |  Cyc  |  PC  | D0 D1 D2 | OP  | C | AM  | Addr / Val |        Registers          |      Flags      |');
    this.verboseLogger.info('|-------|-------|------|----------|-----|---|-----|------------|---------------------------|-----------------|');
  }

  printLine() {
    var basicResults = this.basicFormatters.map(method => method.call(this));
    var verboseResults = this.verboseFormatters.map(method => method.call(this));
    this.basicLogger.info(basicResults.join('  '));
    this.verboseLogger.info(`| ${(verboseResults.join(' | '))} |`);
  }

  //=========================================================
  // Recording
  //=========================================================

  recordOperationBefore() {
    this.cycleBefore = this.cycle;
    this.instructionAddress = this.programCounter;
    this.instructionData = [
      this.readByte(this.instructionAddress),
      this.readByte((this.instructionAddress + 1) & 0xFFFF),
      this.readByte((this.instructionAddress + 2) & 0xFFFF),
    ];
  }

  recordOperationAfter() {
    this.line++;
    this.instructionCycles = this.cycle - this.cycleBefore;
  }

 recordAddressingMode(name, result) {
    this.addressingModeName = name;
    this.instructionSize = this.programCounter - this.instructionAddress;
    this.effectiveAddress = result;
    return result;
  }

  recordInstruction(name, result) {
    this.instructionName = name;
    return result;
  }

  recordState() {
    this.registers = [
      this.accumulator,
      this.registerX,
      this.registerY,
      this.getStatus(),
      this.stackPointer,
    ];
    this.flags = [
      this.negativeFlag,
      this.overflowFlag,
      false,
      false,
      this.decimalMode,
      this.interruptDisable,
      this.zeroFlag,
      this.carryFlag,
    ];
  }

  //=========================================================
  // Formatting
  //=========================================================

  formatLine() {
    return fillLeft(this.line, 5);
  }

  formatCycle() {
    return fillLeft(this.stateAfterOperation ? this.cycle : this.cycleBefore, 5);
  }

  formatProgramCounter() {
    return wordAsHex(this.stateAfterOperation ? this.programCounter : this.instructionAddress);
  }

  formatInstructionData() {
    return this.formatInstructionByte(0) + ' '
       + this.formatInstructionByte(1) + ' '
       + this.formatInstructionByte(2);
  }

  formatInstructionByte(offset) {
    if (offset < this.instructionSize) {
      return byteAsHex(this.instructionData[offset]);
    } else {
      return '  ';
    }
  }

  formatInstructionCode() {
    return this.instructionName || '   ';
  }

  formatInstructionCycles() {
    return this.instructionCycles || ' ';
  }

  formatAddressingMode() {
    return this.addressingModeName || '   ';
  }

  formatAddressingDetails() {
    return '          '; // TODO
  }

  formatRegisters() {
    return ['A', 'X', 'Y', 'P', 'SP']
      .map((name, i) => name + ':' + byteAsHex(this.registers[i]), this)
      .join(' ');
  }

  formatFlags() {
    return ['N', 'V', '?', '?', 'D', 'I', 'Z', 'C']
      .map((name, i) => this.flags[i] ? name : '.', this)
      .join(' ');
  }

}
