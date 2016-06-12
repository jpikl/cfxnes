const buttonNames = {
  1: 'left',
  2: 'right',
  3: 'middle',
  4: 'middle',
};

//=========================================================
// Mouse event handler
//=========================================================

export default class Mouse {

  constructor(inputModule, videoModule) {
    this.inputModule = inputModule;
    this.videoModule = videoModule;
    window.addEventListener('mousemove', event => this.onMouseMove(event));
    window.addEventListener('mousedown', event => this.onMouseDown(event));
    window.addEventListener('mouseup', event => this.onMouseUp(event));
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
    const button = event.button || event.which;
    const input = {source: 'mouse', name: buttonNames[button]};
    if (this.inputModule.processInput(input, down)) {
      event.preventDefault();
    }
  }

  canProcessEvent() {
    return this.inputModule.isRecording() || this.isMouseInCanvasRect();
  }

  isMouseInCanvasRect() {
    const rect = this.videoModule.getOutputRect();
    return this.x >= rect.left
      && this.x <= rect.right
      && this.y >= rect.top
      && this.y <= rect.bottom;
  }

  //=========================================================
  // State
  //=========================================================

  readState(state) {
    state.cursorX = this.x;
    state.cursorY = this.y;
  }

}
