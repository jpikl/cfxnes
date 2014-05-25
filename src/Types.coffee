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

    toString: (mirroring) ->
        switch mirroring
            when Mirroring.SINGLE_SCREEN_1 then "single screen (1)"
            when Mirroring.SINGLE_SCREEN_2 then "single screen (2)"
            when Mirroring.HORIZONTAL      then "horizontal"
            when Mirroring.VERTICAL        then "vertical"
            when Mirroring.FOUR_SCREEN     then "four screen"
            else                                "???"


###########################################################
# TV system types
###########################################################

TVSystem =

    PAL:   1
    NTSC:  2
    OTHER: 3

    toString: (tvSystem) ->
        switch tvSystem
            when TVSystem.PAL   then "PAL"
            when TVSystem.NTSC  then "NTSC"
            else                     "???"

module.exports.Interrupt = Interrupt
module.exports.Mirroring = Mirroring
module.exports.TVSystem  = TVSystem
