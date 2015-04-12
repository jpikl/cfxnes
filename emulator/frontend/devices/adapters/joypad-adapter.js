import { Joypad, Button } from "../../../core/devices/joypad";

const buttonAliases = {
    "a":      Button.A,
    "b":      Button.B,
    "select": Button.SELECT,
    "start":  Button.START,
    "up":     Button.UP,
    "down":   Button.DOWN,
    "left":   Button.LEFT,
    "right":  Button.RIGHT
};

//=========================================================
// Adapter for joypad device
//=========================================================

export class JoypadAdapter {

    constructor(joypad) {
        this.joypad = joypad;
    }

    getDevice() {
        return this.joypad;
    }

    inputChanged(input, down) {
        var button = buttonAliases[input];
        if (button != null) {
            this.joypad.setButtonPressed(button, down);
        }
    }

}
