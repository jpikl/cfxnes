import {log} from '../../../../core';
import SourceInput from '../inputs/SourceInput';

export const MOUSE = 'mouse';
export const MOUSE_CURSOR = 'cursor';

const buttonNames = {
  0: 'left',
  1: 'middle',
  2: 'right',
};

export default class Mouse {

  constructor(router) {
    log.info('Initializing mouse');
    this.router = router;
    this.mouseDownCallback = event => this.onButtonChange(event, true);
    this.mouseUpCallback = event => this.onButtonChange(event, false);
    this.mouseMoveCallback = event => this.onCursorChange(event);
  }

  activate() {
    log.info('Activating mouse');
    window.addEventListener('mousedown', this.mouseDownCallback);
    window.addEventListener('mouseup', this.mouseUpCallback);
    window.addEventListener('mousemove', this.mouseMoveCallback);
  }

  deactivate() {
    log.info('Deactivating mouse');
    window.removeEventListener('mousedown', this.mouseDownCallback);
    window.removeEventListener('mouseup', this.mouseUpCallback);
    window.removeEventListener('mousemove', this.mouseMoveCallback);
  }

  onButtonChange(event, down) {
    const buttonName = buttonNames[event.button];
    const input = new SourceInput(MOUSE, buttonName);
    if (this.router.routeInput(input, down)) {
      event.preventDefault();
    }
  }

  onCursorChange(event) {
    const position = [event.clientX, event.clientY];
    const input = new SourceInput(MOUSE, MOUSE_CURSOR);
    this.router.routeInput(input, position);
  }

}
