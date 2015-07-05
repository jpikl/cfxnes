import { makeEnumeration } from "../utils/objects"

//=========================================================
// Nametable mirroring
//=========================================================

// Defines how are nametables aligned on the screen.
//
// areas: [A, B, C, D] means A | B
//                           --+--
//                           C | D

export var Mirroring = {
    SINGLE_SCREEN_0: {
        name: "single screen (0)",
        areas: [0, 0, 0, 0]
    },
    SINGLE_SCREEN_1: {
        name: "single screen (1)",
        areas: [1, 1, 1, 1]
    },
    SINGLE_SCREEN_2: {
        name: "single screen (2)",
        areas: [2, 2, 2, 2]
    },
    SINGLE_SCREEN_3: {
        name: "single screen (3)",
        areas: [3, 3, 3, 3]
    },
    HORIZONTAL: {
        name: "horizontal",
        areas: [0, 0, 1, 1]
    },
    VERTICAL: {
        name: "vertical",
        areas: [0, 1, 0, 1]
    },
    FOUR_SCREEN: {
        name: "four screen",
        areas: [0, 1, 2, 3]
    },
    getSingleScreen(area) {
        switch(area) {
            case 0: return Mirroring.SINGLE_SCREEN_0;
            case 1: return Mirroring.SINGLE_SCREEN_1;
            case 2: return Mirroring.SINGLE_SCREEN_2;
            case 3: return Mirroring.SINGLE_SCREEN_3;
        }
    }
};

makeEnumeration(Mirroring);
