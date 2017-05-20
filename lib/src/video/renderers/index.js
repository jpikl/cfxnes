import {log, toString} from '../../../../core/src/common';
import CanvasRenderer from './CanvasRenderer';
import WebGLRenderer from './WebGLRenderer';

export const renderers = {
  'canvas': CanvasRenderer,
  'webgl': WebGLRenderer,
};

export function isRendererName(name) {
  return name in renderers;
}

export function createRenderer(name, canvas) {
  const Renderer = renderers[name];
  if (Renderer == null) {
    throw new Error('Invalid renderer: ' + toString(name));
  }

  try {
    log.info(`Creating "${name}" renderer`);
    return new Renderer(canvas);
  } catch (error) {
    log.error(`Failed to create "${name}" renderer`, error);
  }

  if (Renderer !== CanvasRenderer) {
    log.info('Creating "canvas" renderer as fallback');
    return new CanvasRenderer(canvas);
  }

  throw new Error(`Unable to create "${name}" renrerer"`);
}
