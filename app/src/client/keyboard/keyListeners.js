const keyDownListeners = [];

export function addKeyDownListener(listener) {
  const index = keyDownListeners.indexOf(listener);
  if (index < 0) {
    keyDownListeners.push(listener);
  }
}

export function removeKeyDownListener(listener) {
  const index = keyDownListeners.indexOf(listener);
  if (index >= 0) {
    keyDownListeners.splice(index, 1);
  }
}

// Top-level listener registered even before cfxnes
addEventListener('keydown', event => {
  for (const listener of keyDownListeners) {
    if (listener(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      break;
    }
  }
});
