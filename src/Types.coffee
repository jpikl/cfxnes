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
    SINGLE_SCREEN_1: 1
    SINGLE_SCREEN_2: 2
    HORIZONTAL:      3
    VERTICAL:        4
    FOUR_SCREEN:     5

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
