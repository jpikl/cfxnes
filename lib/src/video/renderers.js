import log from '../../../core/src/common/log';
import CanvasRenderer from './renderers/CanvasRenderer';
import WebGLRenderer from './renderers/WebGLRenderer';

const renderers = {
  'canvas': CanvasRenderer,
  'webgl': WebGLRenderer,
};

export function isRendererSupported(name) {
  const Renderer = renderers[name];
  return Renderer != null ? Renderer.isSupported() : false;
}

export function createRenderer(name, canvas) {
  log.info(`Creating "${name}" renderer`);

  const Renderer = renderers[name];
  if (Renderer == null) {
    throw new Error(`Unknown renderer "${name}"`);
  }

  try {
    return new Renderer(canvas);
  } catch (error) {
    log.error(`Failed to create "${name}" renderer`, error);
  }

  if (Renderer !== CanvasRenderer) {
    log.info('Creating "canvas" renderer as fallback');
    return new CanvasRenderer(canvas);
  }

  throw new Error(`Unable to create "${name} renrerer"`);
}
