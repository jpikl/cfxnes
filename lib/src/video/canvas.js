import {assert} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';

const MAXIMIZED = 'maximized';
const NORMALIZED = 'normalized';
const STRETCHED = 'stretched';

const fullscreenStyle = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  margin: 'auto',
  width: 'auto',
  height: 'auto',
};

export function getCanvasById(id) {
  log.info(`Searching canvas element with ID "${id}"`);
  const element = document.getElementById(id);
  assert(element != null, 'Unable to find canvas with specified ID');
  assert(element instanceof HTMLCanvasElement, 'Element with specified ID is not a canvas');
  return element;
}

export function isFullscreenStyle(name) {
  return [MAXIMIZED, NORMALIZED, STRETCHED].indexOf(name) >= 0;
}

export function applyFullscreenStyle(canvas, name) {
  log.info(`Applying "${name}" fullscreen style to canvas`);
  const style = Object.assign(canvas.style, fullscreenStyle);
  if (name === MAXIMIZED) {
    const canvasRatio = window.innerWidth / canvas.height;
    const screenRatio = window.innerHeight / screen.height;
    if (canvasRatio > screenRatio) {
      style.width = '100%';
    } else {
      style.height = '100%';
    }
  } else if (name === STRETCHED) {
    style.width = '100%';
    style.height = '100%';
  }
}

export function removeFullscreenStyle(canvas) {
  log.info('Removing fullscreen style from canvas');
  const style = canvas.style;
  for (const property in fullscreenStyle) {
    style.removeProperty(property);
  }
}
