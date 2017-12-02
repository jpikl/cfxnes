import {log, describe} from '../../../core';
import sources from './sources';

export default class Sources {

  constructor(router) {
    log.info('Initializing sources');

    this.router = router; // Input router
    this.sources = []; // Array of sources
    this.active = false; // Whether sources are active
    this.suspended = false; // Whether sources were suspended before recording of an input
    this.recordCallback = null; // Callback called for a recorded input

    for (const name in sources) {
      const {Source} = sources[name];
      this.sources.push(new Source(this));
    }
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
    if (typeof callback !== 'function') {
      throw new Error('Invalid record input callback: ' + describe(callback));
    }
    log.info('Recording source input');
    this.recordCallback = callback;
    this.suspended = this.active;
    this.setActive(true);
  }

  isRecording() {
    return this.recordCallback != null;
  }

  routeInput(srcInput, value) {
    if (this.recordCallback) {
      if (!value) {
        log.info(`Caught "${srcInput}" source input`);
        this.setActive(this.suspended);
        this.recordCallback(srcInput.toString());
        this.recordCallback = null;
      }
      return true;
    }
    return this.router.routeInput(srcInput, value);
  }

}
