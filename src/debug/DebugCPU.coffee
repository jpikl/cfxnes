Util = require "util"
CPU  = require "../CPU"

class DebugCPU extends CPU

    constructor: (cpuMemory, ppu, papu) ->
        super(cpuMemory, ppu, papu)

    ###########################################################
    # Program execution
    ###########################################################

    readOperation: ->
        @currentAddress = @programCounter
        super()

    ###########################################################
    # Basic addressing modes
    ###########################################################

    impliedMode: =>
        result = super()
        @logOperation 1
        result

    accumulatorMode: =>
        result = super()
        @logOperation 1
        result

    immediateMode: =>
        result = super()
        @logOperation 2
        result

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: =>
        result = super()
        @logOperation 2
        result

    zeroPageXMode: =>
        result = super()
        @logOperation 2
        result

    zeroPageYMode: =>
        result = super()
        @logOperation 2
        result

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: =>
        result = super()
        @logOperation 3
        result

    absoluteXMode: =>
        result = super()
        @logOperation 3
        result

    absoluteYMode: =>
        result = super()
        @logOperation 3
        result

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: =>
        result = super()
        @logOperation 2
        result

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        result = super()
        @logOperation 3
        result

    indirectXMode: =>
        result = super()
        @logOperation 2
        result

    indirectYMode: =>
        result = super()
        @logOperation 2
        result

    ###########################################################
    # Logging utilities
    ###########################################################

    logOperation: (instructionSize) ->
        @logInstructionAddress()
        @logInstructionData instructionSize
        @logInstructionCode()
        Util.print "\n"

    logInstructionAddress: ->
        Util.print "#{@wordAsHex @currentAddress}  "

    logInstructionData: (instructionSize) ->
        @logInstructionByte offset, instructionSize for offset in [0..2]

    logInstructionByte: (offset, size) ->
        if offset < size
            Util.print "#{@byteAsHex @getInstructionByte offset} "
        else
            Util.print "   "

    logInstructionCode: ->
        Util.print " #{@instructionCodes[@getInstructionByte 0]} "

    getInstructionByte: (offset) ->
        @cpuMemory.read (@currentAddress + offset) & 0xFFFF

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
        "BBC", "STA", "???", "SHA", "STY", "STA", "STX", "SAX"
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
