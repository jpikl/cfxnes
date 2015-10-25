import { capitalize } from '../../../core/src/utils/format';

const buttonAliases = {
  1: 'left',
  2: 'right',
  3: 'middle',
  4: 'middle',
};

//=========================================================
// Mouse event handler
//=========================================================

export default class Mouse {

  constructor(id) {
    this.dependencies = ['inputManager', 'videoManager'];
    this.id = id;
  }

  inject(inputManager, videoManager) {
    this.inputManager = inputManager;
    this.videoManager = videoManager;
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
    var button = event.button || event.which;
    var input = buttonAliases[button];
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
  // State reading
  //=========================================================

  readState(state) {
    state.cursorX = this.x;
    state.cursorY = this.y;
  }

  //=========================================================
  // Input names
  //=========================================================

  getInputName(input) {
    return capitalize(input) + ' mouse button';
  }

}
