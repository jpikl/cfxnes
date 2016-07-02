import log from '../../core/src/common/log';
import CanvasRenderer from './renderers/CanvasRenderer';
import WebGLRenderer from './renderers/WebGLRenderer';

const FALLBACK = 'canvas';

const renderers = {
  'canvas': CanvasRenderer,
  'webgl': WebGLRenderer,
};

export function isRendererSupported(id) {
  const clazz = renderers[id];
  return clazz && clazz.isSupported();
}

export function createRenderer(id, canvas) {
  const clazz = renderers[id];
  if (clazz) {
    try {
      return new clazz(canvas);
    } catch (error) {
      log.error(`Error during creation of renderer "${id}"`, error);
    }
  } else {
    log.warn(`Uknown renderer "${id}"`);
  }
  log.info(`Creating "${FALLBACK}" renderer as fallback`);
  return new renderers[FALLBACK](canvas);
}
