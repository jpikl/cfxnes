import {log, toString} from '../../../../core/src/common';
import Canvas2DRenderer from './Canvas2DRenderer';
import WebGLRenderer from './WebGLRenderer';

const CANVAS = 'canvas';
const WEBGL = 'webgl';

export const renderers = {
  [CANVAS]: Canvas2DRenderer,
  [WEBGL]: WebGLRenderer,
};

const fallbacks = {
  [WEBGL]: CANVAS,
};

export function isRendererName(name) {
  return name in renderers;
}

export function createRenderer(name, canvas) {
  do {
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

    name = fallbacks[name]; // eslint-disable-line prefer-destructuring
  } while (name);

  throw new Error('Unable to create renderer');
}
