import {log} from '../../../core';

let detectedPrefix = null;

for (const prefix of ['', 'webkit', 'moz', 'ms']) {
  if (prefixed('fullscreenElement', prefix) in document) {
    detectedPrefix = prefix;
    break;
  }
}

function prefixed(name, prefix = detectedPrefix) {
  if (prefix === 'moz') {
    name = name.replace('exit', 'cancel').replace('screen', 'Screen');
  }
  return prefix + capitalize(name);
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default class Fullscreen {

  // Fullscreen API should use Promises but that is not implemented
  // by current browsers yet, so we have to emulate it using events.

  constructor() {
    this.request = null; // Enter/exit request data
    this.on('change', () => this.onChange());
    this.on('error', () => this.onError());
  }

  supported() {
    return detectedPrefix != null;
  }

  enabled() {
    return this.supported() ? document[prefixed('fullscreenEnabled')] : false;
  }

  is() {
    return this.supported() ? document[prefixed('fullscreenElement')] != null : false;
  }

  on(event, callback) {
    if (this.supported()) {
      const fullscreenEvent = detectedPrefix === 'ms'
        ? `MSFullscreen${capitalize(event)}`
        : `${detectedPrefix}fullscreen${event}`;
      document.addEventListener(fullscreenEvent, callback);
    }
  }

  /** @suppress {checkTypes} ignore invalid closure compiler warning for (this.request == null) condition */
  enter(element) {
    log.info('Fullscreen enter requested');

    if (!this.supported()) {
      return Promise.reject(new Error('Browser does not support fullscreen API'));
    }
    if (!this.enabled()) {
      return Promise.reject(new Error('Browser is blocking fullscreen request'));
    }
    if (this.is()) {
      return Promise.resolve();
    }
    if (this.request && this.request.type === 'exit') {
      return Promise.reject(new Error('Fullscreen exit in progress'));
    }

    if (this.request == null) {
      this.request = {type: 'enter'};
      this.request.promise = new Promise((resolve, reject) => {
        log.info('Entering fullscreen');
        this.request.resolve = resolve;
        this.request.reject = reject;
        element[prefixed('requestFullscreen')]();
      });
    }

    return this.request.promise;
  }

  exit() {
    log.info('Fullscreen exit requested');

    if (!this.is()) {
      return Promise.resolve();
    }
    if (this.request && this.request.type === 'enter') {
      return Promise.reject(new Error('Fullscreen enter in progress'));
    }

    if (this.request == null) {
      this.request = {type: 'exit'};
      this.request.promise = new Promise((resolve, reject) => {
        log.info('Exiting fullscreen');
        this.request.resolve = resolve;
        this.request.reject = reject;
        document[prefixed('exitFullscreen')]();
      });
    }

    return this.request.promise;
  }

  onChange() {
    const type = this.is() ? 'enter' : 'exit';
    log.info(`Fullscreen ${type}ed`);
    if (this.request && this.request.type === type) {
      this.request.resolve();
      this.request = null;
    }
  }

  onError() {
    log.error('Detected fullscreen error');
    if (this.request) {
      this.request.reject(new Error(`Failed to ${this.request.type} fullscreen`));
      this.request = null;
    }
  }

}
