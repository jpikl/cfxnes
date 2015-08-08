import { capitalize } from "../../core/utils/format"

const axisAliases = [
    "left-stick-x", "left-stick-y",
    "right-stick-x", "right-stick-y",
]

const buttonAliases = [
    "a", "b", "x", "y",
    "left-bumper", "right-bumper",
    "left-trigger", "right-trigger",
    "back", "start",
    "left-stick", "rigt-stick",
    "dpad-up", "dpad-down", "dpad-left", "dpad-right",
    "guide"
];

//=========================================================
// Gamepad event handler
//=========================================================

export class Gamepad {

    constructor(id) {
        this.dependencies = ["inputManager"];
        this.id = id;
        this.gamepads = {};
    }

    inject(inputManager) {
        this.inputManager = inputManager;
        this.scheduleNextUpdate();
    }

    //=========================================================
    // Periodical polling of gamepad state
    //=========================================================

    scheduleNextUpdate() {
        if (navigator.getGamepads) {
            requestAnimationFrame(() => this.updateGamepads());
        }
    }

    updateGamepads() {
        var gamepads = this.readGamepads();
        if (this.gamepads != null) {
            this.detectChanges(this.gamepads, gamepads);
        }
        this.gamepads = gamepads;
        this.scheduleNextUpdate();
    }

    readGamepads() {
        var state = {};
        var gamepads = navigator.getGamepads();
        for (var i = 0; i < gamepads.length; i++) {
            var gamepad = gamepads[i];
            state[i] = gamepad && {
                index: gamepad.index,
                mapping: gamepad.mapping,
                axes: gamepad.axes.map(axis => axis > 0.5 ? 1 : (axis < -0.5 ? -1 : 0)),
                buttons: gamepad.buttons.map(button => button.pressed)
            };
        }
        return state;
    }

    //=========================================================
    // Detection of gamepad changes
    //=========================================================

    detectChanges(oldGamepads, newGamepads) {
        for (gamepadIndex in oldGamepads) {
            var oldGamepad = oldGamepads[gamepadIndex];
            var newGamepad = newGamepads[gamepadIndex];
            if (oldGamepad && newGamepad) {
                var oldAxes = oldGamepad.axes;
                var newAxes = newGamepad.axes;
                for (var i = 0; i < Math.min(oldAxes.length, newAxes.length); i++) {
                    if (oldAxes[i] !== newAxes[i]) {
                        this.onAxisChange(oldGamepad, i, oldAxes[i], newAxes[i]);
                    }
                }
                var oldButtons = oldGamepad.buttons;
                var newButtons = newGamepad.buttons;
                for (var i = 0; i < Math.min(oldButtons.length, newButtons.length); i++) {
                    if (oldButtons[i] !== newButtons[i]) {
                        this.onButtonChange(oldGamepad, i, newButtons[i]);
                    }
                }
            }
        }
    }

    //=========================================================
    // Event callbacks
    //=========================================================

    onAxisChange(gamepad, axisIndex, oldValue, newValue) {
        if (oldValue) {
            var input = this.createAxisInput(gamepad, axisIndex, oldValue);
            this.processInput(gamepad, input, false);
        }
        if (newValue) {
            var input = this.createAxisInput(gamepad, axisIndex, newValue);
            this.processInput(gamepad, input, true);
        }
    }

    onButtonChange(gamepad, buttonIndex, newValue) {
        var input = this.createButtonInput(gamepad, buttonIndex);
        this.processInput(gamepad, input, newValue);
    }

    //=========================================================
    // Input processing
    //=========================================================

    createAxisInput(gamepad, axisIndex, value) {
        var baseInput;
        if (gamepad.mapping === "standard") {
            baseInput = axisAliases[axisIndex]; // Standard name
        }
        if (!baseInput) {
            baseInput = "axis-" + axisIndex;  // Generic name
        }
        baseInput += value > 0 ? "+" : "-";     // Axis direction
        return this.createInput(gamepad, baseInput);
    }

    createButtonInput(gamepad, buttonIndex) {
        var baseInput;
        if (gamepad.mapping === "standard") {
            baseInput = buttonAliases[buttonIndex]; // Standard name
        }
        if (!baseInput) {
            baseInput = "button-" + buttonIndex;    // Generic name
        }
        return this.createInput(gamepad, baseInput);
    }

    createInput(gamepad, baseInput) {
        return gamepad.index + "/" + baseInput;
    }

    processInput(gamepad, input, down) {
        this.inputManager.processInput(this.id, input, down);
    }

    //=========================================================
    // Input names
    //=========================================================

    getInputName(input) {
        var [gamepadIndex, baseInput] = input.split("/");
        return `GP${gamepadIndex} / `
             + capitalize(baseInput.replace("-", " "))
                .replace("Dpad", "D-pad")
                .replace("X ", "X-")
                .replace("Y ", "Y-");
    }

}
