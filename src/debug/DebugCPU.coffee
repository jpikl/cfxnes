CPU  = require "../CPU"
Util = require "../utils/Util"

byteAsHex = Util.byteAsHex
wordAsHex = Util.wordAsHex
fillLeft  = Util.fillLeft
fillRight = Util.fillRight

###########################################################
# CPU with debugging printouts
###########################################################

class DebugCPU extends CPU

    constructor: ->
        super()
        @startLogging()

    ###########################################################
    # Program execution
    ###########################################################

    executeInstruction: ->
        @logOperationBefore()
        super()
        @logOperationAfter()


    ###########################################################
    # Addressing modes
    ###########################################################

    impliedMode:     => @logAddressingMode "imp", super()
    accumulatorMode: => @logAddressingMode "acc", super()
    immediateMode:   => @logAddressingMode "imm", super()
    zeroPageMode:    => @logAddressingMode "zpg", super()
    zeroPageXMode:   => @logAddressingMode "zpx", super()
    zeroPageYMode:   => @logAddressingMode "zpy", super()
    absoluteMode:    => @logAddressingMode "abs", super()
    absoluteXMode:   => @logAddressingMode "abx", super()
    absoluteYMode:   => @logAddressingMode "aby", super()
    relativeMode:    => @logAddressingMode "abx", super()
    indirectMode:    => @logAddressingMode "ind", super()
    indirectXMode:   => @logAddressingMode "inx", super()
    indirectYMode:   => @logAddressingMode "iny", super()

    ###########################################################
    # Instructions
    ###########################################################

    NOP: (address) => @logInstruction "NOP", super(address)
    CLC: (address) => @logInstruction "CLC", super(address)
    CLI: (address) => @logInstruction "CLI", super(address)
    CLD: (address) => @logInstruction "CLD", super(address)
    CLV: (address) => @logInstruction "CLV", super(address)
    SEC: (address) => @logInstruction "SEC", super(address)
    SEI: (address) => @logInstruction "SEI", super(address)
    SED: (address) => @logInstruction "SED", super(address)
    STA: (address) => @logInstruction "STA", super(address)
    STX: (address) => @logInstruction "STX", super(address)
    SAX: (address) => @logInstruction "SAX", super(address)
    STY: (address) => @logInstruction "STY", super(address)
    LDA: (address) => @logInstruction "LDA", super(address)
    LDX: (address) => @logInstruction "LDX", super(address)
    LAX: (address) => @logInstruction "LAX", super(address)
    LDY: (address) => @logInstruction "LDY", super(address)
    TAX: (address) => @logInstruction "TAX", super(address)
    TAY: (address) => @logInstruction "TAY", super(address)
    TXA: (address) => @logInstruction "TXA", super(address)
    TYA: (address) => @logInstruction "TYA", super(address)
    TSX: (address) => @logInstruction "TSX", super(address)
    TXS: (address) => @logInstruction "TXS", super(address)
    PHA: (address) => @logInstruction "PHA", super(address)
    PHP: (address) => @logInstruction "PHP", super(address)
    PLA: (address) => @logInstruction "PLA", super(address)
    PLP: (address) => @logInstruction "PLP", super(address)
    AND: (address) => @logInstruction "AND", super(address)
    ORA: (address) => @logInstruction "ORA", super(address)
    EOR: (address) => @logInstruction "EOR", super(address)
    BIT: (address) => @logInstruction "BIT", super(address)
    INC: (address) => @logInstruction "INC", super(address)
    INX: (address) => @logInstruction "INX", super(address)
    INY: (address) => @logInstruction "INY", super(address)
    DEC: (address) => @logInstruction "DEC", super(address)
    DEX: (address) => @logInstruction "DEX", super(address)
    DEY: (address) => @logInstruction "DEY", super(address)
    CMP: (address) => @logInstruction "CMP", super(address)
    CPX: (address) => @logInstruction "CPX", super(address)
    CPY: (address) => @logInstruction "CPY", super(address)
    BCC: (address) => @logInstruction "BCC", super(address)
    BCS: (address) => @logInstruction "BCS", super(address)
    BNE: (address) => @logInstruction "BNE", super(address)
    BEQ: (address) => @logInstruction "BEQ", super(address)
    BVC: (address) => @logInstruction "BVC", super(address)
    BVS: (address) => @logInstruction "BVS", super(address)
    BPL: (address) => @logInstruction "BPL", super(address)
    BMI: (address) => @logInstruction "BMI", super(address)
    JMP: (address) => @logInstruction "JMP", super(address)
    JSR: (address) => @logInstruction "JSR", super(address)
    RTS: (address) => @logInstruction "RTS", super(address)
    BRK: (address) => @logInstruction "BRK", super(address)
    RTI: (address) => @logInstruction "RTI", super(address)
    ADC: (address) => @logInstruction "ADC", super(address)
    SBC: (address) => @logInstruction "SBC", super(address)
    ASL: (address) => @logInstruction "ASL", super(address)
    LSR: (address) => @logInstruction "LSR", super(address)
    ROL: (address) => @logInstruction "ROL", super(address)
    ROR: (address) => @logInstruction "ROR", super(address)
    DCP: (address) => @logInstruction "DCP", super(address)
    ISB: (address) => @logInstruction "ISB", super(address)
    SLO: (address) => @logInstruction "SLO", super(address)
    SRE: (address) => @logInstruction "SRE", super(address)
    RLA: (address) => @logInstruction "RLA", super(address)
    RRA: (address) => @logInstruction "RRA", super(address)

    ###########################################################
    # Logging
    ###########################################################

    startLogging: ->
        @logHeader()
        @linesCount = 0
        @formatterMethods = [
            @formatLinesCount
            @formatCyclesCount
            @formatInstructionAddress
            @formatInstructionData
            @formatInstructionCode
            @formatInstructionCycles
            @formatAddressingMode
            @formatAddressingDetails
            @formatRegisters
            @formatFlags
        ]

    logHeader: ->
        console.log "/-------+-------+------+----------+-----+---+-----+------------+---------------------------+-----------------\\"
        console.log "|     # |  Cyc  |  PC  | D0 D1 D2 | OP  | C | AM  | Addr / Val |        Registers          |      Flags      |"
        console.log "|-------|-------|------|----------|-----|---|-----|------------|---------------------------|-----------------|"

    logAddressingMode: (name, result) ->
        @addressingModeName = name
        @instructionSize = @programCounter - @instructionAddress
        @effectiveAddress = result

    logInstruction: (name, result) ->
        @instructionName = name
        result

    logOperationBefore: ->
        @cyclesCountBefore = @cyclesCount
        @registers = [ @accumulator, @registerX, @registerY, @getStatus(), @stackPointer ]
        @flags = [ @negativeFlag, @overflowFlag, false, false, @decimalMode, @interruptDisable, @zeroFlag, @carryFlag ]
        @instructionAddress = @programCounter
        @instructionData = [
            @read @instructionAddress
            @read (@instructionAddress + 1) & 0xFFFF
            @read (@instructionAddress + 2) & 0xFFFF
        ]

    logOperationAfter: ->
        @linesCount++
        @instructionCycles = @cyclesCount - @cyclesCountBefore
        result = (method() for method in @formatterMethods)
        console.log "| #{result.join ' | '} |"

    ###########################################################
    # Formatting
    ###########################################################

    formatLinesCount: =>
        fillLeft @linesCount, 5

    formatCyclesCount: =>
        fillLeft @cyclesCountBefore, 5

    formatInstructionAddress: =>
        wordAsHex @instructionAddress

    formatInstructionData: =>
        (@formatInstructionByte offset for offset in [0..2]).join " "

    formatInstructionByte: (offset) ->
        if offset < @instructionSize
            byteAsHex @instructionData[offset] 
        else 
            "  "

    formatInstructionCode: =>
        @instructionName

    formatInstructionCycles: =>
        @instructionCycles

    formatAddressingMode: =>
        @addressingModeName

    formatAddressingDetails: =>
        "          " # TODO

    formatRegisters: =>
        names = [ "A", "X", "Y", "P", "SP" ]
        ("#{names[i]}:#{byteAsHex register}" for register, i in @registers).join " "

    formatFlags: =>
        names = [ "N", "V", "?", "?", "D", "I", "Z", "C" ]
        ((if flag then names[i] else ".") for flag, i in @flags).join " "

module.exports = DebugCPU
