import log from '../../../core/src/common/log';
import Keyboard from './sources/Keyboard';
import Mouse from './sources/Mouse';
import Gamepad from './sources/Gamepad';

export default class Sources {

  constructor(router) {
    log.info('Initializing sources');
    this.router = router;
    this.active = false;
    this.sources = [
      new Keyboard(this),
      new Mouse(this),
      new Gamepad(this),
    ];
  }

  setActive(active) {
    if (this.active !== active) {
      log.info(`Sources ${active ? 'activated' : 'deactivated'}`);
      if (active) {
        this.sources.forEach(source => source.activate());
      } else {
        this.sources.forEach(source => source.deactivate());
      }
      this.active = active;
    }
  }

  isActive() {
    return this.active;
  }

  recordInput(callback) {
    log.info('Recording source input');
    this.recordCallback = callback;
    this.wasActive = this.active;
    this.setActive(true);
  }

  isRecording() {
    return this.recordCallback != null;
  }

  routeInput(srcInput, value) {
    if (this.recordCallback) {
      if (!value) {
        log.info(`Caught "${srcInput}" source input`);
        this.setActive(this.wasActive);
        this.recordCallback(srcInput.toString());
        this.recordCallback = null;
      }
      return true;
    }
    return this.router.routeInput(srcInput, value);
  }

}
