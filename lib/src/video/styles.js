import log from '../../../core/src/common/log';

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

export function applyFullscreenStyle(canvas, name) {
  log.info(`Applying "${name}" fullscreen style to canvas`);
  const style = Object.assign(canvas.style, fullscreenStyle);
  if (name === 'maximized') {
    const canvasRatio = window.innerWidth / canvas.height;
    const screenRatio = window.innerHeight / screen.height;
    if (canvasRatio > screenRatio) {
      style.width = '100%';
    } else {
      style.height = '100%';
    }
  } else if (name === 'stretched') {
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
