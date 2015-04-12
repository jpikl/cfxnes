import { CPU }                            from "../units/cpu";
import { byteAsHex, wordAsHex, fillLeft } from "../utils/format";
import { Logger }                         from "../utils/logger";

var basicLogger   = Logger.get("debug-basic");
var verboseLogger = Logger.get("debug-verbose");

//=========================================================
// CPU with debugging printouts
//=========================================================

export class DebugCPU extends CPU {

    //=========================================================
    // Program execution
    //=========================================================

    handleReset() {
        super.handleReset();
        this.startLogging();
    }

    executeOperation() {
        this.logOperationBefore();
        super.executeOperation();
        this.logOperationAfter();
    }

    //=========================================================
    // Addressing modes
    //=========================================================

    impliedMode()     { return this.logAddressingMode("imp", super.impliedMode());     }
    accumulatorMode() { return this.logAddressingMode("acc", super.accumulatorMode()); }
    immediateMode()   { return this.logAddressingMode("imm", super.immediateMode());   }
    zeroPageMode()    { return this.logAddressingMode("zpg", super.zeroPageMode());    }
    zeroPageXMode()   { return this.logAddressingMode("zpx", super.zeroPageXMode());   }
    zeroPageYMode()   { return this.logAddressingMode("zpy", super.zeroPageYMode());   }
    absoluteMode()    { return this.logAddressingMode("abs", super.absoluteMode());    }
    absoluteXMode()   { return this.logAddressingMode("abx", super.absoluteXMode());   }
    absoluteYMode()   { return this.logAddressingMode("aby", super.absoluteYMode());   }
    relativeMode()    { return this.logAddressingMode("abx", super.relativeMode());    }
    indirectMode()    { return this.logAddressingMode("ind", super.indirectMode());    }
    indirectXMode()   { return this.logAddressingMode("inx", super.indirectXMode());   }
    indirectYMode()   { return this.logAddressingMode("iny", super.indirectYMode());   }

    //=========================================================
    // Instructions
    //=========================================================

    NOP(address) { return this.logInstruction("NOP", super.NOP(address)); }
    CLC(address) { return this.logInstruction("CLC", super.CLC(address)); }
    CLI(address) { return this.logInstruction("CLI", super.CLI(address)); }
    CLD(address) { return this.logInstruction("CLD", super.CLD(address)); }
    CLV(address) { return this.logInstruction("CLV", super.CLV(address)); }
    SEC(address) { return this.logInstruction("SEC", super.SEC(address)); }
    SEI(address) { return this.logInstruction("SEI", super.SEI(address)); }
    SED(address) { return this.logInstruction("SED", super.SED(address)); }
    STA(address) { return this.logInstruction("STA", super.STA(address)); }
    STX(address) { return this.logInstruction("STX", super.STX(address)); }
    SAX(address) { return this.logInstruction("SAX", super.SAX(address)); }
    STY(address) { return this.logInstruction("STY", super.STY(address)); }
    SHX(address) { return this.logInstruction("SHX", super.SHX(address)); }
    SHY(address) { return this.logInstruction("SHY", super.SHY(address)); }
    LDA(address) { return this.logInstruction("LDA", super.LDA(address)); }
    LDX(address) { return this.logInstruction("LDX", super.LDX(address)); }
    LDY(address) { return this.logInstruction("LDY", super.LDY(address)); }
    LAX(address) { return this.logInstruction("LAX", super.LAX(address)); }
    LAS(address) { return this.logInstruction("LAS", super.LAS(address)); }
    TAX(address) { return this.logInstruction("TAX", super.TAX(address)); }
    TAY(address) { return this.logInstruction("TAY", super.TAY(address)); }
    TXA(address) { return this.logInstruction("TXA", super.TXA(address)); }
    TYA(address) { return this.logInstruction("TYA", super.TYA(address)); }
    TSX(address) { return this.logInstruction("TSX", super.TSX(address)); }
    TXS(address) { return this.logInstruction("TXS", super.TXS(address)); }
    PHA(address) { return this.logInstruction("PHA", super.PHA(address)); }
    PHP(address) { return this.logInstruction("PHP", super.PHP(address)); }
    PLA(address) { return this.logInstruction("PLA", super.PLA(address)); }
    PLP(address) { return this.logInstruction("PLP", super.PLP(address)); }
    AND(address) { return this.logInstruction("AND", super.AND(address)); }
    ORA(address) { return this.logInstruction("ORA", super.ORA(address)); }
    EOR(address) { return this.logInstruction("EOR", super.EOR(address)); }
    BIT(address) { return this.logInstruction("BIT", super.BIT(address)); }
    INC(address) { return this.logInstruction("INC", super.INC(address)); }
    INX(address) { return this.logInstruction("INX", super.INX(address)); }
    INY(address) { return this.logInstruction("INY", super.INY(address)); }
    DEC(address) { return this.logInstruction("DEC", super.DEC(address)); }
    DEX(address) { return this.logInstruction("DEX", super.DEX(address)); }
    DEY(address) { return this.logInstruction("DEY", super.DEY(address)); }
    CMP(address) { return this.logInstruction("CMP", super.CMP(address)); }
    CPX(address) { return this.logInstruction("CPX", super.CPX(address)); }
    CPY(address) { return this.logInstruction("CPY", super.CPY(address)); }
    BCC(address) { return this.logInstruction("BCC", super.BCC(address)); }
    BCS(address) { return this.logInstruction("BCS", super.BCS(address)); }
    BNE(address) { return this.logInstruction("BNE", super.BNE(address)); }
    BEQ(address) { return this.logInstruction("BEQ", super.BEQ(address)); }
    BVC(address) { return this.logInstruction("BVC", super.BVC(address)); }
    BVS(address) { return this.logInstruction("BVS", super.BVS(address)); }
    BPL(address) { return this.logInstruction("BPL", super.BPL(address)); }
    BMI(address) { return this.logInstruction("BMI", super.BMI(address)); }
    JMP(address) { return this.logInstruction("JMP", super.JMP(address)); }
    JSR(address) { return this.logInstruction("JSR", super.JSR(address)); }
    RTS(address) { return this.logInstruction("RTS", super.RTS(address)); }
    BRK(address) { return this.logInstruction("BRK", super.BRK(address)); }
    RTI(address) { return this.logInstruction("RTI", super.RTI(address)); }
    ADC(address) { return this.logInstruction("ADC", super.ADC(address)); }
    SBC(address) { return this.logInstruction("SBC", super.SBC(address)); }
    ASL(address) { return this.logInstruction("ASL", super.ASL(address)); }
    LSR(address) { return this.logInstruction("LSR", super.LSR(address)); }
    ROL(address) { return this.logInstruction("ROL", super.ROL(address)); }
    ROR(address) { return this.logInstruction("ROR", super.ROR(address)); }
    DCP(address) { return this.logInstruction("DCP", super.DCP(address)); }
    ISB(address) { return this.logInstruction("ISB", super.ISB(address)); }
    SLO(address) { return this.logInstruction("SLO", super.SLO(address)); }
    SRE(address) { return this.logInstruction("SRE", super.SRE(address)); }
    RLA(address) { return this.logInstruction("RLA", super.RLA(address)); }
    XAA(address) { return this.logInstruction("XAA", super.XAA(address)); }
    RRA(address) { return this.logInstruction("RRA", super.RRA(address)); }
    AXS(address) { return this.logInstruction("AXS", super.AXS(address)); }
    ANC(address) { return this.logInstruction("ANC", super.ANC(address)); }
    ALR(address) { return this.logInstruction("ALR", super.ALR(address)); }
    ARR(address) { return this.logInstruction("ARR", super.ARR(address)); }
    TAS(address) { return this.logInstruction("TAS", super.TAS(address)); }

    //=========================================================
    // Logging
    //=========================================================

    startLogging() {
        this.line = 0;
        this.logHeader();
        this.basicLogFormatterMethods = [
            this.formatInstructionAddress,
            this.formatInstructionData,
            this.formatInstructionCode,
            this.formatRegisters
        ];
        this.verboseLogFormatterMethods = [
            this.formatLine,
            this.formatCycle,
            this.formatInstructionAddress,
            this.formatInstructionData,
            this.formatInstructionCode,
            this.formatInstructionCycles,
            this.formatAddressingMode,
            this.formatAddressingDetails,
            this.formatRegisters,
            this.formatFlags
        ];
    }

    logHeader() {
        verboseLogger.info("/-------+-------+------+----------+-----+---+-----+------------+---------------------------+-----------------\\");
        verboseLogger.info("|     # |  Cyc  |  PC  | D0 D1 D2 | OP  | C | AM  | Addr / Val |        Registers          |      Flags      |");
        verboseLogger.info("|-------|-------|------|----------|-----|---|-----|------------|---------------------------|-----------------|");
    }

    logAddressingMode(name, result) {
        this.addressingModeName = name;
        this.instructionSize = this.programCounter - this.instructionAddress;
        this.effectiveAddress = result;
        return result;
    }

    logInstruction(name, result) {
        this.instructionName = name;
        return result;
    }

    logOperationBefore() {
        this.cycleBefore = this.cycle;
        this.registers = [
            this.accumulator,
            this.registerX,
            this.registerY,
            this.getStatus(),
            this.stackPointer
        ];
        this.flags = [
            this.negativeFlag,
            this.overflowFlag,
            false,
            false,
            this.decimalMode,
            this.interruptDisable,
            this.zeroFlag,
            this.carryFlag
        ];
        this.instructionAddress = this.programCounter;
        this.instructionData = [
            this.readByte(this.instructionAddress),
            this.readByte((this.instructionAddress + 1) & 0xFFFF),
            this.readByte((this.instructionAddress + 2) & 0xFFFF)
        ];
    }

    logOperationAfter() {
        this.line++;
        this.instructionCycles = this.cycle - this.cycleBefore;

        var basicResults = [];
        var verboseResults = [];

        for (var method of this.basicLogFormatterMethods) {
            basicResults.push(method.call(this));
        }
        for (var method of this.verboseLogFormatterMethods) {
            verboseResults.push(method.call(this));
        }

        basicLogger.info(basicResults.join("  "));
        verboseLogger.info(`| ${(verboseResults.join(' | '))} |`);
    }

    //=========================================================
    // Formatting
    //=========================================================

    formatLine() {
        return fillLeft(this.line, 5);
    }

    formatCycle() {
        return fillLeft(this.cycleBefore, 5);
    }

    formatInstructionAddress() {
        return wordAsHex(this.instructionAddress);
    }

    formatInstructionData() {
        return this.formatInstructionByte(0) + " "
             + this.formatInstructionByte(1) + " "
             + this.formatInstructionByte(2);
    }

    formatInstructionByte(offset) {
        if (offset < this.instructionSize) {
            return byteAsHex(this.instructionData[offset]);
        } else {
            return "  ";
        }
    }

    formatInstructionCode() {
        return this.instructionName;
    }

    formatInstructionCycles() {
        return this.instructionCycles;
    }

    formatAddressingMode() {
        return this.addressingModeName;
    }

    formatAddressingDetails() {
        return "          "; // TODO
    }

    formatRegisters() {
        var names = [ "A", "X", "Y", "P", "SP" ];
        var results = [];
        for (var i = 0; i < names.length; i++) {
            results.push(names[i] + ":" + (byteAsHex(this.registers[i])));
        }
        return results.join(" ");
    }

    formatFlags() {
        var names = [ "N", "V", "?", "?", "D", "I", "Z", "C" ];
        var results = [];
        for (var i = 0; i < names.length; i++) {
            results.push(this.flags[i] ? names[i] : ".");
        }
        return results.join(" ");
    }

}
