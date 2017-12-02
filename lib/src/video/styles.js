import {log} from '../../../core';

export const MAXIMIZED = 'maximized';
export const NORMALIZED = 'normalized';
export const STRETCHED = 'stretched';

const names = [MAXIMIZED, NORMALIZED, STRETCHED];

const defaultStyle = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  margin: 'auto',
  width: 'auto',
  height: 'auto',
};

export function isStyleName(name) {
  return names.indexOf(name) >= 0;
}

export function applyStyle(canvas, name) {
  log.info(`Applying "${name}" style to canvas`);
  const style = Object.assign(canvas.style, defaultStyle);

  if (name === MAXIMIZED) {
    const canvasRatio = canvas.width / canvas.height;
    const screenRatio = window.innerWidth / window.innerHeight;

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

export function removeStyle(canvas) {
  log.info('Removing style from canvas');
  const {style} = canvas;
  for (const property in defaultStyle) {
    style.removeProperty(property);
  }
}
