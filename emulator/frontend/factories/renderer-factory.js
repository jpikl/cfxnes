import { CanvasRenderer } from "../renderers/canvas-renderer";
import { WebGLRenderer }  from "../renderers/webgl-renderer";
import { logger }         from "../../core/utils/logger";

const FALLBACK_RENDERER = "canvas";

export function RendererFactory() {
  this.renderers = {
    "canvas": CanvasRenderer,
    "webgl": WebGLRenderer
  };
}

RendererFactory.prototype.isRendererSupported = function(id) {
  try {
    return this.renderers[id].isSupported();
  } catch (_error) {
    return false;
  }
};

RendererFactory.prototype.createRenderer = function(id, canvas) {
  var error;
  try {
    logger.info("Creating renderer '" + id + "'");
    return this.createRendererUnsafe(id, canvas);
  } catch (_error) {
    error = _error;
    logger.error("Error when creating renderer '" + id + "': " + error);
    if (id === FALLBACK_RENDERER) {
      throw error;
    }
    logger.info("Creating fallback renderer '" + FALLBACK_RENDERER + "'");
    return this.createRendererUnsafe(FALLBACK_RENDERER, canvas);
  }
};

RendererFactory.prototype.createRendererUnsafe = function(id, canvas) {
  return new this.renderers[id](canvas);
};
