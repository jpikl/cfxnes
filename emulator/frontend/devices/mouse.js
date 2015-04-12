const BUTTON_ALIASES = {
    1: "left",
    2: "right",
    3: "middle",
    4: "middle"
};

//=========================================================
// Mouse event handler
//=========================================================

export class Mouse {

    constructor(id) {
        this.id = id;
    }

    init(inputManager, videoManager) {
        this.inputManager = inputManager;
        this.videoManager = videoManager;
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    //=========================================================
    // Event callbacks
    //=========================================================

    onMouseMove(event) {
        event = event || window.event;
        this.x = event.clientX;
        this.y = event.clientY;
    }

    onMouseDown(event) {
        if (this.canProcessEvent()) {
            this.processEvent(event, true);
        }
    }

    onMouseUp(event) {
        if (this.canProcessEvent()) {
            this.processEvent(event, false);
        }
    }

    //=========================================================
    // Event processing
    //=========================================================

    processEvent(event, down) {
        event = event || window.event;
        var button = event.button || event.which;
        var input = BUTTON_ALIASES[button];
        if (input && this.inputManager.processInput(this.id, input, down)) {
            event.preventDefault();
        }
    }

    canProcessEvent() {
        return this.inputManager.isRecording() || this.isMouseInCanvasRect();
    }

    isMouseInCanvasRect() {
        var rect = this.videoManager.getOutputRect();
        return this.x >= rect.left
            && this.x <= rect.right
            && this.y >= rect.top
            && this.y <= rect.bottom;
    }

    //=========================================================
    // Inputs
    //=========================================================

    readState(state) {
        state.cursorX = this.x;
        state.cursorY = this.y;
    }

    getInputName(input) {
        return input[0].toUpperCase() + input.slice(1) + " mouse button";
    }

}

Mouse["dependencies"] = [ "inputManager", "videoManager" ];
