###########################################################
# Interrupt types
###########################################################

Interrupt =
    IRQ:   1
    NMI:   2
    RESET: 3

###########################################################
# Name table mirroring types
###########################################################

Mirroring = 
    SINGLE_SCREEN: 1
    HORIZONTAL:    2
    VERTICAL:      3
    FOUR_SCREEN:   4

###########################################################
# TV system types
###########################################################

TVSystem = 
    PAL:   1
    NTSC:  2
    OTHER: 3

module.exports.Interrupt = Interrupt
module.exports.Mirroring = Mirroring
module.exports.TVSystem  = TVSystem
