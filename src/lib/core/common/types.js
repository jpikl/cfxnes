//=========================================================
// Interupt types (flags)
//=========================================================

export var Interrupt = {

    RESET:   0x01, // CPU reset
    NMI:     0x02, // Non-maskable interrupt
    IRQ_APU: 0x04, // Interrupt caused by APU
    IRQ_DCM: 0x08, // Interrupt caused by DCM channel
    IRQ_EXT: 0x10  // Interrupt caused by mapper

};

// Mask for all IRQ types
Interrupt.IRQ = Interrupt.IRQ_APU | Interrupt.IRQ_DCM | Interrupt.IRQ_EXT;

//=========================================================
// Nametable mirroring types
//=========================================================

export var Mirroring = {

    // Alignment of name    A | B
    // tables on screen    ---+---
    //                      C | D

                        // A B C D
    SINGLE_SCREEN_0: 1, // 0 0 0 0
    SINGLE_SCREEN_1: 2, // 1 1 1 1
    SINGLE_SCREEN_2: 3, // 2 2 2 2
    SINGLE_SCREEN_3: 4, // 3 3 3 3
    HORIZONTAL:      5, // 0 0 1 1
    VERTICAL:        6, // 0 1 0 1
    FOUR_SCREEN:     7, // 0 1 2 3

    getSingleScreen(area) {
        return Mirroring.SINGLE_SCREEN_0 + area;
    },

    toString(mirroring) {
        switch (mirroring) {
            case Mirroring.SINGLE_SCREEN_0:
                return "single screen (0)";
            case Mirroring.SINGLE_SCREEN_1:
                return "single screen (1)";
            case Mirroring.SINGLE_SCREEN_2:
                return "single screen (2)";
            case Mirroring.SINGLE_SCREEN_3:
                return "single screen (3)";
            case Mirroring.HORIZONTAL:
                return "horizontal";
            case Mirroring.VERTICAL:
                return "vertical";
            case Mirroring.FOUR_SCREEN:
                return "four screen";
            default:
                return "???";
        }
    }

};

//=========================================================
// TV system types
//=========================================================

export var TVSystem = {

    NTSC: 1,
    PAL:  2,

    toString(tvSystem) {
        switch (tvSystem) {
            case TVSystem.PAL:
                return "PAL";
            case TVSystem.NTSC:
                return "NTSC";
            default:
                return "???";
        }
    }

};
