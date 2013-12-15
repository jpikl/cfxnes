Util = require "util"
CPU  = require "../CPU"

class DebugCPU extends CPU

    constructor: (cpuMemory, ppu, papu) ->
        super(cpuMemory, ppu, papu)
        @startLogging()

    handleReset: ->
        super()
        @programCounter = 0xC000

    ###########################################################
    # Basic addressing modes
    ###########################################################

    impliedMode: =>
        @processAddressingMode "imp", super(), "N", 1

    accumulatorMode: =>
        @processAddressingMode "acc", super(), "N", 1

    immediateMode: =>
        @processAddressingMode "imm", super(), "I", 2

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: =>
        @processAddressingMode "zpg", super(), "B", 2

    zeroPageXMode: =>
        @processAddressingMode "zpx", super(), "B", 2

    zeroPageYMode: =>
        @processAddressingMode "zpy", super(), "B", 2

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: =>
        @processAddressingMode "abs", super(), "W", 3

    absoluteXMode: =>
        @processAddressingMode "abx", super(), "W", 3

    absoluteYMode: =>
        @processAddressingMode "aby", super(), "W", 3

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: =>
        @processAddressingMode "rel", super(), "W", 2

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        @processAddressingMode "ind", super(), "W", 3

    indirectXMode: =>
        @processAddressingMode "inx", super(), "W", 2

    indirectYMode: =>
        @processAddressingMode "iny", super(), "W", 2

    ###########################################################
    # Logging
    ###########################################################

    processAddressingMode: (addressingModeName, effectiveAddress, addressType, instructionSize) -> 
        @logOperation addressingModeName, effectiveAddress, addressType, instructionSize
        effectiveAddress

    startLogging: ->
        @logLines = 0
        @logHeader()

    logHeader: ->
        Util.puts "/-------+-------+------+----------+-----+-----+------------+---------------------------+-----------------\\"
        Util.puts "|     # |  Cyc  |  PC  | D0 D1 D2 | OP  | AM  | Addr / Val |        Registers          |      Flags      |"
        Util.puts "|-------|-------|------|----------|-----|-----|------------|---------------------------|-----------------|"

    logOperation: (addressingModeName, effectiveAddress, addressType, instructionSize) ->
        instructionAddress = (@programCounter - instructionSize) & 0xFFFF
        instructionData = [
            @cpuMemory.read instructionAddress
            @cpuMemory.read (instructionAddress + 1) & 0xFFFF
            @cpuMemory.read (instructionAddress + 2) & 0xFFFF
        ]
        @logLinesCount()
        @logCyclesCount()
        @logInstructionAddress instructionAddress
        @logInstructionData instructionData, instructionSize
        @logInstructionCode instructionData[0]
        @logAddressingMode addressingModeName
        @logAddressingDetails effectiveAddress, addressType
        @logRegisters()
        @logFlags()

    logLinesCount: ->
        result = "        #{@logLines++} "
        Util.print "|" + result[result.length - 7 ...]

    logCyclesCount: ->
        result = "        #{@cycle} "
        Util.print "|" + result[result.length - 7 ...]

    logInstructionAddress: (address) ->
        Util.print "| #{@wordAsHex address} | "

    logInstructionData: (data, size) ->
        @logInstructionByte data[offset], offset < size for offset in [0..2]

    logInstructionByte: (byte, visible) ->
        if visible
            Util.print "#{@byteAsHex byte} "
        else
            Util.print "   "

    logInstructionCode: (operationCode) ->
        Util.print "| #{@instructionCodes[operationCode]} |"

    logAddressingMode: (name) ->
        Util.print " #{name} | "

    logAddressingDetails: (address, type) ->
        Util.print ("#{@getAddressingDetails address, type}          ")[0...10] + " | "

    getAddressingDetails: (address, type) ->
        switch type
            when "N" then ""
            when "I" then "##{@byteAsHex @cpuMemory.read address}"
            when "B" then "$#{@byteAsHex address} = #{@byteAsHex @cpuMemory.read address}"
            when "W" then "$#{@wordAsHex address} = #{@byteAsHex @cpuMemory.read address}"

    logRegisters: ->
        Util.print "A:#{@byteAsHex @accumulator} "
        Util.print "X:#{@byteAsHex @registerX} "
        Util.print "Y:#{@byteAsHex @registerY} "
        Util.print "P:#{@byteAsHex @getStatus()} "
        Util.print "SP:#{@byteAsHex @stackPointer} | "

    logFlags: ->
        Util.print "#{@booleanAsText @negativeFlag, 'N'} "
        Util.print "#{@booleanAsText @overflowFlag, 'V'} "
        Util.print "? "
        Util.print "? "
        Util.print "#{@booleanAsText @decimalMode, 'D'} "
        Util.print "#{@booleanAsText @interruptDisable, 'I'} "
        Util.print "#{@booleanAsText @zeroFlag, 'Z'} "
        Util.print "#{@booleanAsText @carryFlag, 'C'} |\n"

    booleanAsText: (value, char) ->
        if value then char else "."

    ###########################################################
    # Instruction codes
    ###########################################################

    instructionCodes: [
        "BRK", "ORA", "???", "SLO", "NOP", "ORA", "ASL", "SLO"
        "PHP", "ORA", "ASL", "ANC", "NOP", "ORA", "ASL", "SLO"
        "BPL", "ORA", "???", "SLO", "NOP", "ORA", "ASL", "SLO"
        "CLC", "ORA", "NOP", "SLO", "NOP", "ORA", "ASL", "SLO"
        "JSR", "AND", "???", "RLA", "BIT", "AND", "ROL", "RLA"
        "PLP", "AND", "ROL", "ANC", "BIT", "AND", "ROL", "RLA"
        "BMI", "AND", "???", "RLA", "NOP", "AND", "ROL", "RLA"
        "SEC", "AND", "NOP", "RLA", "NOP", "AND", "ROL", "RLA"
        "RTI", "EOR", "???", "SRE", "NOP", "EOR", "LSR", "SRE"
        "PHA", "EOR", "LSR", "ASR", "JMP", "EOR", "LSR", "SRE"
        "BVC", "EOR", "???", "SRE", "NOP", "EOR", "LSR", "SRE"
        "CLI", "EOR", "NOP", "SRE", "NOP", "EOR", "LSR", "SRE"
        "RTS", "ADC", "???", "RRA", "NOP", "ADC", "ROR", "RRA"
        "PLA", "ADC", "ROR", "ARR", "JMP", "ADC", "ROR", "RRA"
        "BVS", "ADC", "???", "RRA", "NOP", "ADC", "ROR", "RRA"
        "SEI", "ADC", "NOP", "RRA", "NOP", "ADC", "ROR", "RRA"
        "NOP", "STA", "NOP", "SAX", "STY", "STA", "STX", "SAX"
        "DEY", "NOP", "TXA", "ANE", "STY", "STA", "STX", "SAX"
        "BCC", "STA", "???", "SHA", "STY", "STA", "STX", "SAX"
        "TYA", "STA", "TXS", "SHS", "SHY", "STA", "SHX", "SHA"
        "LDY", "LDA", "LDX", "LAX", "LDY", "LDA", "LDX", "LAX"
        "TAY", "LDA", "TAX", "LXA", "LDY", "LDA", "LDX", "LAX"
        "BCS", "LDA", "???", "LAX", "LDY", "LDA", "LDX", "LAX"
        "CLV", "LDA", "TSX", "LAS", "LDY", "LDA", "LDX", "LAX"
        "CPY", "CMP", "NOP", "DCP", "CPY", "CMP", "DEC", "DCP"
        "INY", "CMP", "DEX", "SBX", "CPY", "CMP", "DEC", "DCP"
        "BNE", "CMP", "???", "DCP", "NOP", "CMP", "DEC", "DCP"
        "CLD", "CMP", "NOP", "DCP", "NOP", "CMP", "DEC", "DCP"
        "CPX", "SBC", "NOP", "ISB", "CPX", "SBC", "INC", "ISB"
        "INX", "SBC", "NOP", "SBC", "CPX", "SBC", "INC", "ISB"
        "BEQ", "SBC", "???", "ISB", "NOP", "SBC", "INC", "ISB"
        "SED", "SBC", "NOP", "ISB", "NOP", "SBC", "INC", "ISB"
    ]

module.exports = DebugCPU
