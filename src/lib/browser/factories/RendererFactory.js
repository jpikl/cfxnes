// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import CanvasRenderer from '../renderers/CanvasRenderer';
import WebGLRenderer from '../renderers/WebGLRenderer';
import logger from '../../core/utils/logger';

const FALLBACK_RENDERER = 'canvas';

const renderers = {
  'canvas': CanvasRenderer,
  'webgl': WebGLRenderer,
};

//=========================================================
// Factory for renderer creation
//=========================================================

export default class RendererFactory {

  isRendererSupported(id) {
    var clazz = renderers[id];
    return clazz && clazz['isSupported'](); // jscs:ignore requireDotNotation
  }

  createRenderer(id, canvas) {
    try {
      logger.info(`Creating "${id}" renderer`);
      return this.createRendererUnsafe(id, canvas);
    } catch (error) {
      logger.error(`Error when creating renderer "${id}": ${error}`);
      if (id === FALLBACK_RENDERER) {
        throw error;
      }
      logger.info(`Creating fallback "${FALLBACK_RENDERER}" renderer`);
      return this.createRendererUnsafe(FALLBACK_RENDERER, canvas);
    }
  }

  createRendererUnsafe(id, canvas) {
    var clazz = renderers[id];
    if (!clazz) {
      throw new Error(`Unsupported renderer "${id}"`);
    }
    return new clazz(canvas);
  }

}
