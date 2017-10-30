export function dispatchKeyboardEvent(type, options) {
  dispatchEvent(createKeyboardEvent(type, options));
}

export function dispatchMouseEvent(type, options) {
  dispatchEvent(createMouseEvent(type, options));
}

export function createKeyboardEvent(type, options = {}) {
  const {keyCode} = options;
  if (typeof KeyboardEvent === 'function') {
    const event = new KeyboardEvent(type, options);
    if (keyCode && event.keyCode !== keyCode) {
      Object.defineProperty(event, 'keyCode', {get: () => keyCode}); // Chrome issue
    }
    return event;
  }
  // IE does not support KeyboardEvent constructor
  const event = document.createEvent('KeyboardEvent');
  event.initKeyboardEvent(type, false, false, null, '', '', false, '', false);
  if (keyCode) {
    Object.defineProperty(event, 'keyCode', {get: () => keyCode});
  }
  return event;
}

export function createMouseEvent(type, options = {}) {
  if (typeof MouseEvent === 'function') {
    return new MouseEvent(type, options);
  }
  // IE does not support MouseEvent constructor
  const event = document.createEvent('MouseEvent');
  event.initMouseEvent(type,
    false, false, null, 1,
    options.screenX || 0,
    options.screenY || 0,
    options.clientX || 0,
    options.clientY || 0,
    false, false, false, false,
    options.button || 0,
    false);
  return event;
}
