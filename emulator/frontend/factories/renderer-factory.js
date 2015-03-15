var FALLBACK_RENDERER, logger;

logger = require("../../core/utils/logger").get();

FALLBACK_RENDERER = "canvas";

function RendererFactory() {
  this.renderers = {
    "canvas": require("../renderers/canvas-renderer"),
    "webgl": require("../renderers/webgl-renderer")
  };
}

RendererFactory.prototype.isRendererSupported = function(id) {
  try {
    return this.getRendererClass(id).isSupported();
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

module.exports = RendererFactory;
