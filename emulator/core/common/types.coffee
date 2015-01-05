###########################################################
# Interupt types (flags)
###########################################################

Interrupt =

    RESET:   0x01 # CPU reset
    NMI:     0x02 # PPU non-maskable interrupt
    IRQ_APU: 0x04 # APU frame counter interrupt
    IRQ_DCM: 0x08 # DCM channel interrupt
    IRQ_EXT: 0x10 # External interrupt from mapper

# IRQ type mask
Interrupt.IRQ = Interrupt.IRQ_APU | Interrupt.IRQ_DCM | Interrupt.IRQ_EXT

module.exports.Interrupt = Interrupt

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

module.exports.Mirroring = Mirroring

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

module.exports.TVSystem  = TVSystem
