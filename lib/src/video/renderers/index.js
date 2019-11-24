import {log, describe} from '../../../../core';
import Canvas2dRenderer from './Canvas2dRenderer';
import WebGlRenderer from './WebGlRenderer';

export const CANVAS = 'canvas';
export const WEBGL = 'webgl';

export const renderers = {
  [CANVAS]: Canvas2dRenderer,
  [WEBGL]: WebGlRenderer,
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
      throw new Error('Invalid renderer: ' + describe(name));
    }

    try {
      log.info(`Creating "${name}" renderer`);
      return new Renderer(canvas);
    } catch (error) {
      log.error(`Failed to create "${name}" renderer`, error);
    }

    name = fallbacks[name];
  } while (name);

  throw new Error('Unable to create renderer');
}
