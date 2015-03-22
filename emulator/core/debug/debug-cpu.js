import { CPU } from "../units/cpu";
import { byteAsHex, wordAsHex, fillLeft } from "../utils/format";
import { Logger } from "../utils/logger";

  var
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;


var basicLogger = Logger.get("debug-basic");
var verboseLogger = Logger.get("debug-verbose");

export function DebugCPU() {
  this.formatFlags = bind(this.formatFlags, this);
  this.formatRegisters = bind(this.formatRegisters, this);
  this.formatAddressingDetails = bind(this.formatAddressingDetails, this);
  this.formatAddressingMode = bind(this.formatAddressingMode, this);
  this.formatInstructionCycles = bind(this.formatInstructionCycles, this);
  this.formatInstructionCode = bind(this.formatInstructionCode, this);
  this.formatInstructionData = bind(this.formatInstructionData, this);
  this.formatInstructionAddress = bind(this.formatInstructionAddress, this);
  this.formatCycle = bind(this.formatCycle, this);
  this.formatLine = bind(this.formatLine, this);
  DebugCPU.__super__.constructor.call(this);
  this.startLogging();
}

extend(DebugCPU, CPU);

DebugCPU.prototype.executeOperation = function() {
  this.logOperationBefore();
  DebugCPU.__super__.executeOperation.call(this);
  return this.logOperationAfter();
};

DebugCPU.prototype.impliedMode = function() {
  return this.logAddressingMode("imp", DebugCPU.__super__.impliedMode.call(this));
};

DebugCPU.prototype.accumulatorMode = function() {
  return this.logAddressingMode("acc", DebugCPU.__super__.accumulatorMode.call(this));
};

DebugCPU.prototype.immediateMode = function() {
  return this.logAddressingMode("imm", DebugCPU.__super__.immediateMode.call(this));
};

DebugCPU.prototype.zeroPageMode = function() {
  return this.logAddressingMode("zpg", DebugCPU.__super__.zeroPageMode.call(this));
};

DebugCPU.prototype.zeroPageXMode = function() {
  return this.logAddressingMode("zpx", DebugCPU.__super__.zeroPageXMode.call(this));
};

DebugCPU.prototype.zeroPageYMode = function() {
  return this.logAddressingMode("zpy", DebugCPU.__super__.zeroPageYMode.call(this));
};

DebugCPU.prototype.absoluteMode = function() {
  return this.logAddressingMode("abs", DebugCPU.__super__.absoluteMode.call(this));
};

DebugCPU.prototype.absoluteXMode = function() {
  return this.logAddressingMode("abx", DebugCPU.__super__.absoluteXMode.call(this));
};

DebugCPU.prototype.absoluteYMode = function() {
  return this.logAddressingMode("aby", DebugCPU.__super__.absoluteYMode.call(this));
};

DebugCPU.prototype.relativeMode = function() {
  return this.logAddressingMode("abx", DebugCPU.__super__.relativeMode.call(this));
};

DebugCPU.prototype.indirectMode = function() {
  return this.logAddressingMode("ind", DebugCPU.__super__.indirectMode.call(this));
};

DebugCPU.prototype.indirectXMode = function() {
  return this.logAddressingMode("inx", DebugCPU.__super__.indirectXMode.call(this));
};

DebugCPU.prototype.indirectYMode = function() {
  return this.logAddressingMode("iny", DebugCPU.__super__.indirectYMode.call(this));
};

DebugCPU.prototype.NOP = function(address) {
  return this.logInstruction("NOP", DebugCPU.__super__.NOP.call(this, address));
};

DebugCPU.prototype.CLC = function(address) {
  return this.logInstruction("CLC", DebugCPU.__super__.CLC.call(this, address));
};

DebugCPU.prototype.CLI = function(address) {
  return this.logInstruction("CLI", DebugCPU.__super__.CLI.call(this, address));
};

DebugCPU.prototype.CLD = function(address) {
  return this.logInstruction("CLD", DebugCPU.__super__.CLD.call(this, address));
};

DebugCPU.prototype.CLV = function(address) {
  return this.logInstruction("CLV", DebugCPU.__super__.CLV.call(this, address));
};

DebugCPU.prototype.SEC = function(address) {
  return this.logInstruction("SEC", DebugCPU.__super__.SEC.call(this, address));
};

DebugCPU.prototype.SEI = function(address) {
  return this.logInstruction("SEI", DebugCPU.__super__.SEI.call(this, address));
};

DebugCPU.prototype.SED = function(address) {
  return this.logInstruction("SED", DebugCPU.__super__.SED.call(this, address));
};

DebugCPU.prototype.STA = function(address) {
  return this.logInstruction("STA", DebugCPU.__super__.STA.call(this, address));
};

DebugCPU.prototype.STX = function(address) {
  return this.logInstruction("STX", DebugCPU.__super__.STX.call(this, address));
};

DebugCPU.prototype.SAX = function(address) {
  return this.logInstruction("SAX", DebugCPU.__super__.SAX.call(this, address));
};

DebugCPU.prototype.STY = function(address) {
  return this.logInstruction("STY", DebugCPU.__super__.STY.call(this, address));
};

DebugCPU.prototype.SHX = function(address) {
  return this.logInstruction("SHX", DebugCPU.__super__.SHX.call(this, address));
};

DebugCPU.prototype.SHY = function(address) {
  return this.logInstruction("SHY", DebugCPU.__super__.SHY.call(this, address));
};

DebugCPU.prototype.LDA = function(address) {
  return this.logInstruction("LDA", DebugCPU.__super__.LDA.call(this, address));
};

DebugCPU.prototype.LDX = function(address) {
  return this.logInstruction("LDX", DebugCPU.__super__.LDX.call(this, address));
};

DebugCPU.prototype.LDY = function(address) {
  return this.logInstruction("LDY", DebugCPU.__super__.LDY.call(this, address));
};

DebugCPU.prototype.LAX = function(address) {
  return this.logInstruction("LAX", DebugCPU.__super__.LAX.call(this, address));
};

DebugCPU.prototype.LAS = function(address) {
  return this.logInstruction("LAS", DebugCPU.__super__.LAS.call(this, address));
};

DebugCPU.prototype.TAX = function(address) {
  return this.logInstruction("TAX", DebugCPU.__super__.TAX.call(this, address));
};

DebugCPU.prototype.TAY = function(address) {
  return this.logInstruction("TAY", DebugCPU.__super__.TAY.call(this, address));
};

DebugCPU.prototype.TXA = function(address) {
  return this.logInstruction("TXA", DebugCPU.__super__.TXA.call(this, address));
};

DebugCPU.prototype.TYA = function(address) {
  return this.logInstruction("TYA", DebugCPU.__super__.TYA.call(this, address));
};

DebugCPU.prototype.TSX = function(address) {
  return this.logInstruction("TSX", DebugCPU.__super__.TSX.call(this, address));
};

DebugCPU.prototype.TXS = function(address) {
  return this.logInstruction("TXS", DebugCPU.__super__.TXS.call(this, address));
};

DebugCPU.prototype.PHA = function(address) {
  return this.logInstruction("PHA", DebugCPU.__super__.PHA.call(this, address));
};

DebugCPU.prototype.PHP = function(address) {
  return this.logInstruction("PHP", DebugCPU.__super__.PHP.call(this, address));
};

DebugCPU.prototype.PLA = function(address) {
  return this.logInstruction("PLA", DebugCPU.__super__.PLA.call(this, address));
};

DebugCPU.prototype.PLP = function(address) {
  return this.logInstruction("PLP", DebugCPU.__super__.PLP.call(this, address));
};

DebugCPU.prototype.AND = function(address) {
  return this.logInstruction("AND", DebugCPU.__super__.AND.call(this, address));
};

DebugCPU.prototype.ORA = function(address) {
  return this.logInstruction("ORA", DebugCPU.__super__.ORA.call(this, address));
};

DebugCPU.prototype.EOR = function(address) {
  return this.logInstruction("EOR", DebugCPU.__super__.EOR.call(this, address));
};

DebugCPU.prototype.BIT = function(address) {
  return this.logInstruction("BIT", DebugCPU.__super__.BIT.call(this, address));
};

DebugCPU.prototype.INC = function(address) {
  return this.logInstruction("INC", DebugCPU.__super__.INC.call(this, address));
};

DebugCPU.prototype.INX = function(address) {
  return this.logInstruction("INX", DebugCPU.__super__.INX.call(this, address));
};

DebugCPU.prototype.INY = function(address) {
  return this.logInstruction("INY", DebugCPU.__super__.INY.call(this, address));
};

DebugCPU.prototype.DEC = function(address) {
  return this.logInstruction("DEC", DebugCPU.__super__.DEC.call(this, address));
};

DebugCPU.prototype.DEX = function(address) {
  return this.logInstruction("DEX", DebugCPU.__super__.DEX.call(this, address));
};

DebugCPU.prototype.DEY = function(address) {
  return this.logInstruction("DEY", DebugCPU.__super__.DEY.call(this, address));
};

DebugCPU.prototype.CMP = function(address) {
  return this.logInstruction("CMP", DebugCPU.__super__.CMP.call(this, address));
};

DebugCPU.prototype.CPX = function(address) {
  return this.logInstruction("CPX", DebugCPU.__super__.CPX.call(this, address));
};

DebugCPU.prototype.CPY = function(address) {
  return this.logInstruction("CPY", DebugCPU.__super__.CPY.call(this, address));
};

DebugCPU.prototype.BCC = function(address) {
  return this.logInstruction("BCC", DebugCPU.__super__.BCC.call(this, address));
};

DebugCPU.prototype.BCS = function(address) {
  return this.logInstruction("BCS", DebugCPU.__super__.BCS.call(this, address));
};

DebugCPU.prototype.BNE = function(address) {
  return this.logInstruction("BNE", DebugCPU.__super__.BNE.call(this, address));
};

DebugCPU.prototype.BEQ = function(address) {
  return this.logInstruction("BEQ", DebugCPU.__super__.BEQ.call(this, address));
};

DebugCPU.prototype.BVC = function(address) {
  return this.logInstruction("BVC", DebugCPU.__super__.BVC.call(this, address));
};

DebugCPU.prototype.BVS = function(address) {
  return this.logInstruction("BVS", DebugCPU.__super__.BVS.call(this, address));
};

DebugCPU.prototype.BPL = function(address) {
  return this.logInstruction("BPL", DebugCPU.__super__.BPL.call(this, address));
};

DebugCPU.prototype.BMI = function(address) {
  return this.logInstruction("BMI", DebugCPU.__super__.BMI.call(this, address));
};

DebugCPU.prototype.JMP = function(address) {
  return this.logInstruction("JMP", DebugCPU.__super__.JMP.call(this, address));
};

DebugCPU.prototype.JSR = function(address) {
  return this.logInstruction("JSR", DebugCPU.__super__.JSR.call(this, address));
};

DebugCPU.prototype.RTS = function(address) {
  return this.logInstruction("RTS", DebugCPU.__super__.RTS.call(this, address));
};

DebugCPU.prototype.BRK = function(address) {
  return this.logInstruction("BRK", DebugCPU.__super__.BRK.call(this, address));
};

DebugCPU.prototype.RTI = function(address) {
  return this.logInstruction("RTI", DebugCPU.__super__.RTI.call(this, address));
};

DebugCPU.prototype.ADC = function(address) {
  return this.logInstruction("ADC", DebugCPU.__super__.ADC.call(this, address));
};

DebugCPU.prototype.SBC = function(address) {
  return this.logInstruction("SBC", DebugCPU.__super__.SBC.call(this, address));
};

DebugCPU.prototype.ASL = function(address) {
  return this.logInstruction("ASL", DebugCPU.__super__.ASL.call(this, address));
};

DebugCPU.prototype.LSR = function(address) {
  return this.logInstruction("LSR", DebugCPU.__super__.LSR.call(this, address));
};

DebugCPU.prototype.ROL = function(address) {
  return this.logInstruction("ROL", DebugCPU.__super__.ROL.call(this, address));
};

DebugCPU.prototype.ROR = function(address) {
  return this.logInstruction("ROR", DebugCPU.__super__.ROR.call(this, address));
};

DebugCPU.prototype.DCP = function(address) {
  return this.logInstruction("DCP", DebugCPU.__super__.DCP.call(this, address));
};

DebugCPU.prototype.ISB = function(address) {
  return this.logInstruction("ISB", DebugCPU.__super__.ISB.call(this, address));
};

DebugCPU.prototype.SLO = function(address) {
  return this.logInstruction("SLO", DebugCPU.__super__.SLO.call(this, address));
};

DebugCPU.prototype.SRE = function(address) {
  return this.logInstruction("SRE", DebugCPU.__super__.SRE.call(this, address));
};

DebugCPU.prototype.RLA = function(address) {
  return this.logInstruction("RLA", DebugCPU.__super__.RLA.call(this, address));
};

DebugCPU.prototype.XAA = function(address) {
  return this.logInstruction("XAA", DebugCPU.__super__.XAA.call(this, address));
};

DebugCPU.prototype.RRA = function(address) {
  return this.logInstruction("RRA", DebugCPU.__super__.RRA.call(this, address));
};

DebugCPU.prototype.AXS = function(address) {
  return this.logInstruction("AXS", DebugCPU.__super__.AXS.call(this, address));
};

DebugCPU.prototype.ANC = function(address) {
  return this.logInstruction("ANC", DebugCPU.__super__.ANC.call(this, address));
};

DebugCPU.prototype.ALR = function(address) {
  return this.logInstruction("ALR", DebugCPU.__super__.ALR.call(this, address));
};

DebugCPU.prototype.ARR = function(address) {
  return this.logInstruction("ARR", DebugCPU.__super__.ARR.call(this, address));
};

DebugCPU.prototype.TAS = function(address) {
  return this.logInstruction("TAS", DebugCPU.__super__.TAS.call(this, address));
};

DebugCPU.prototype.startLogging = function() {
  this.line = 0;
  this.logHeader();
  this.basicLogFormatterMethods = [this.formatInstructionAddress, this.formatInstructionData, this.formatInstructionCode, this.formatRegisters];
  return this.verboseLogFormatterMethods = [this.formatLine, this.formatCycle, this.formatInstructionAddress, this.formatInstructionData, this.formatInstructionCode, this.formatInstructionCycles, this.formatAddressingMode, this.formatAddressingDetails, this.formatRegisters, this.formatFlags];
};

DebugCPU.prototype.logHeader = function() {
  verboseLogger.info("/-------+-------+------+----------+-----+---+-----+------------+---------------------------+-----------------\\");
  verboseLogger.info("|     # |  Cyc  |  PC  | D0 D1 D2 | OP  | C | AM  | Addr / Val |        Registers          |      Flags      |");
  return verboseLogger.info("|-------|-------|------|----------|-----|---|-----|------------|---------------------------|-----------------|");
};

DebugCPU.prototype.logAddressingMode = function(name, result) {
  this.addressingModeName = name;
  this.instructionSize = this.programCounter - this.instructionAddress;
  return this.effectiveAddress = result;
};

DebugCPU.prototype.logInstruction = function(name, result) {
  this.instructionName = name;
  return result;
};

DebugCPU.prototype.logOperationBefore = function() {
  this.cycleBefore = this.cycle;
  this.registers = [this.accumulator, this.registerX, this.registerY, this.getStatus(), this.stackPointer];
  this.flags = [this.negativeFlag, this.overflowFlag, false, false, this.decimalMode, this.interruptDisable, this.zeroFlag, this.carryFlag];
  this.instructionAddress = this.programCounter;
  return this.instructionData = [this.read(this.instructionAddress), this.read((this.instructionAddress + 1) & 0xFFFF), this.read((this.instructionAddress + 2) & 0xFFFF)];
};

DebugCPU.prototype.logOperationAfter = function() {
  var basicResult, method, verboseResult;
  this.line++;
  this.instructionCycles = this.cycle - this.cycleBefore;
  basicResult = (function() {
    var j, len, ref, results;
    ref = this.basicLogFormatterMethods;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      method = ref[j];
      results.push(method());
    }
    return results;
  }).call(this);
  basicLogger.info(basicResult.join("  "));
  verboseResult = (function() {
    var j, len, ref, results;
    ref = this.verboseLogFormatterMethods;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      method = ref[j];
      results.push(method());
    }
    return results;
  }).call(this);
  return verboseLogger.info("| " + (verboseResult.join(' | ')) + " |");
};

DebugCPU.prototype.formatLine = function() {
  return fillLeft(this.line, 5);
};

DebugCPU.prototype.formatCycle = function() {
  return fillLeft(this.cycleBefore, 5);
};

DebugCPU.prototype.formatInstructionAddress = function() {
  return wordAsHex(this.instructionAddress);
};

DebugCPU.prototype.formatInstructionData = function() {
  var offset;
  return ((function() {
    var j, results;
    results = [];
    for (offset = j = 0; j <= 2; offset = ++j) {
      results.push(this.formatInstructionByte(offset));
    }
    return results;
  }).call(this)).join(" ");
};

DebugCPU.prototype.formatInstructionByte = function(offset) {
  if (offset < this.instructionSize) {
    return byteAsHex(this.instructionData[offset]);
  } else {
    return "  ";
  }
};

DebugCPU.prototype.formatInstructionCode = function() {
  return this.instructionName;
};

DebugCPU.prototype.formatInstructionCycles = function() {
  return this.instructionCycles;
};

DebugCPU.prototype.formatAddressingMode = function() {
  return this.addressingModeName;
};

DebugCPU.prototype.formatAddressingDetails = function() {
  return "          ";
};

DebugCPU.prototype.formatRegisters = function() {
  var i, names, register;
  names = ["A", "X", "Y", "P", "SP"];
  return ((function() {
    var j, len, ref, results;
    ref = this.registers;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      register = ref[i];
      results.push(names[i] + ":" + (byteAsHex(register)));
    }
    return results;
  }).call(this)).join(" ");
};

DebugCPU.prototype.formatFlags = function() {
  var flag, i, names;
  names = ["N", "V", "?", "?", "D", "I", "Z", "C"];
  return ((function() {
    var j, len, ref, results;
    ref = this.flags;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      flag = ref[i];
      results.push(flag ? names[i] : ".");
    }
    return results;
  }).call(this)).join(" ");
};
