var system = require("../utils/system")

//=========================================================
// Joypad input device
//=========================================================

class Joypad {

    constructor() {
        this.buttonStates = system.newUint8Array(24);
        this.buttonStates[19] = 1;
        this.readPosition = 0;
    }

    strobe() {
        this.readPosition = 0;
    }

    read() {
        var state = this.buttonStates[this.readPosition];
        this.readPosition = (this.readPosition + 1) % this.buttonStates.length;
        return state;
    }

    setButtonPressed(button, pressed) {
        return this.buttonStates[button] = pressed ? 1 : 0;
    }

}

//=========================================================
// Joypad buttons
//=========================================================

Joypad["Button"] = {
    A:      0,
    B:      1,
    SELECT: 2,
    START:  3,
    UP:     4,
    DOWN:   5,
    LEFT:   6,
    RIGHT:  7
};

module.exports = Joypad;
