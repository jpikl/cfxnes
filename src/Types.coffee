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

    SINGLE_SCREEN_0: 1
    SINGLE_SCREEN_1: 2
    SINGLE_SCREEN_2: 3
    SINGLE_SCREEN_3: 4
    HORIZONTAL:      5
    VERTICAL:        6
    FOUR_SCREEN:     7

    getSingleScreen: (area) ->
        Mirroring.SINGLE_SCREEN_0 + area

    toString: (mirroring) ->
        switch mirroring
            when Mirroring.SINGLE_SCREEN_0 then "single screen (0)"
            when Mirroring.SINGLE_SCREEN_1 then "single screen (1)"
            when Mirroring.SINGLE_SCREEN_2 then "single screen (2)"
            when Mirroring.SINGLE_SCREEN_3 then "single screen (3)"
            when Mirroring.HORIZONTAL      then "horizontal"
            when Mirroring.VERTICAL        then "vertical"
            when Mirroring.FOUR_SCREEN     then "four screen"
            else                                "???"


###########################################################
# TV system types
###########################################################

TVSystem =

    NTSC:  1
    PAL:   2

    toString: (tvSystem) ->
        switch tvSystem
            when TVSystem.PAL   then "PAL"
            when TVSystem.NTSC  then "NTSC"
            else                     "???"

module.exports.Interrupt = Interrupt
module.exports.Mirroring = Mirroring
module.exports.TVSystem  = TVSystem
