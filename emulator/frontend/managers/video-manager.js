var DEFAULT_DEBUGGING, DEFAULT_PALETTE, DEFAULT_RENDERER, DEFAULT_SCALE, DEFAULT_SMOOTHING, VIDEO_HEIGHT, VIDEO_WIDTH, logger,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

logger = require("../../core/utils/logger").get();

VIDEO_WIDTH = require("../../core/common/constants").VIDEO_WIDTH;

VIDEO_HEIGHT = require("../../core/common/constants").VIDEO_HEIGHT;

DEFAULT_DEBUGGING = false;

DEFAULT_SMOOTHING = false;

DEFAULT_SCALE = 1;

DEFAULT_PALETTE = "default";

DEFAULT_RENDERER = "webgl";

function VideoManager() {
  this.onFullscreenChange = bind(this.onFullscreenChange, this);
}

VideoManager.dependencies = ["nes", "rendererFactory", "paletteFactory"];

VideoManager.prototype.init = function(nes, rendererFactory, paletteFactory) {
  logger.info("Initializing video manager");
  this.nes = nes;
  this.rendererFactory = rendererFactory;
  this.paletteFactory = paletteFactory;
  this.initListeners();
  return this.setDefaults();
};

VideoManager.prototype.initListeners = function() {
  return document.addEventListener(screenfull.raw.fullscreenchange, this.onFullscreenChange);
};

VideoManager.prototype.setDefaults = function() {
  logger.info("Using default video configuration");
  this.setDebugging(DEFAULT_DEBUGGING);
  this.setSmoothing(DEFAULT_SMOOTHING);
  this.setScale(DEFAULT_SCALE);
  this.setPalette(DEFAULT_PALETTE);
  return this.setRenderer(DEFAULT_RENDERER);
};

VideoManager.prototype.setCanvas = function(canvas) {
  logger.info("Setting video output to " + canvas);
  this.canvas = canvas;
  if (this.canvas) {
    this.updateCanvasSize();
    this.createRenderer();
    return this.drawFrame();
  }
};

VideoManager.prototype.isCanvasVisible = function() {
  var ref;
  return this.canvas && ((ref = this.canvas) != null ? ref.offsetParent : void 0) !== null;
};

VideoManager.prototype.updateCanvasSize = function() {
  var widthMultiplier;
  widthMultiplier = this.debugging ? 2 : 1;
  this.canvas.width = this.scale * VIDEO_WIDTH * widthMultiplier;
  return this.canvas.height = this.scale * VIDEO_HEIGHT;
};

VideoManager.prototype.getOutputRect = function() {
  var rect;
  if (this.isCanvasVisible()) {
    rect = this.isFullScreen() ? this.getFullScreenRect() : this.getCanvasRect();
    if (this.debugging) {
      rect.right -= (rect.right - rect.left) / 2;
    }
    return rect;
  } else {
    return this.getEmptyRect();
  }
};

VideoManager.prototype.getCanvasRect = function() {
  return this.canvas.getBoundingClientRect();
};

VideoManager.prototype.getFullScreenRect = function() {
  return {
    left: 0,
    right: screen.width,
    top: 0,
    bottom: screen.height
  };
};

VideoManager.prototype.getEmptyRect = function() {
  return {
    left: -1,
    right: -1,
    top: -1,
    bottom: -1
  };
};

VideoManager.prototype.isRendererSupported = function(id) {
  return this.rendererFactory.isRendererSupported(id);
};

VideoManager.prototype.setRenderer = function(id) {
  if (id == null) {
    id = DEFAULT_RENDERER;
  }
  logger.info("Using '" + id + "' video renderer");
  this.rendererId = id;
  if (this.canvas) {
    return this.createRenderer();
  }
};

VideoManager.prototype.getRenderer = function() {
  return this.rendererId;
};

VideoManager.prototype.createRenderer = function() {
  this.renderer = this.rendererFactory.createRenderer(this.rendererId, this.canvas);
  this.renderer.setSmoothing(this.smoothing);
  this.renderer.setScale(this.scale);
  this.frame = this.renderer.createFrame(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  return this.debugFrame = this.renderer.createFrame(VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
};

VideoManager.prototype.renderFrame = function() {
  this.nes.renderFrame(this.frame.data);
  if (this.debugging) {
    return this.nes.renderDebugFrame(this.debugFrame.data);
  }
};

VideoManager.prototype.drawFrame = function() {
  this.renderer.begin();
  this.renderer.drawFrame(this.frame);
  if (this.debugging) {
    this.renderer.drawFrame(this.debugFrame);
  }
  return this.renderer.end();
};

VideoManager.prototype.setPalette = function(id) {
  if (id == null) {
    id = DEFAULT_PALETTE;
  }
  logger.info("Setting video palette to '" + id + "'");
  this.paletteId = id;
  return this.nes.setRGBAPalette(this.paletteFactory.createPalette(id));
};

VideoManager.prototype.getPalette = function() {
  return this.paletteId;
};

VideoManager.prototype.setDebugging = function(enabled) {
  if (enabled == null) {
    enabled = DEFAULT_DEBUGGING;
  }
  logger.info("Setting video debugging to " + (enabled ? 'on' : 'off'));
  this.debugging = enabled;
  if (this.canvas) {
    this.updateCanvasSize();
    return this.drawFrame();
  }
};

VideoManager.prototype.isDebugging = function() {
  return this.debugging;
};

VideoManager.prototype.setSmoothing = function(enabled) {
  if (enabled == null) {
    enabled = DEFAULT_SMOOTHING;
  }
  logger.info("Setting video smoothing to " + (enabled ? 'on' : 'off'));
  this.smoothing = enabled;
  if (this.canvas) {
    if (this.renderer) {
      this.renderer.setSmoothing(enabled);
    }
    return this.drawFrame();
  }
};

VideoManager.prototype.isSmoothing = function() {
  return this.smoothing;
};

VideoManager.prototype.setScale = function(scale) {
  if (scale == null) {
    scale = DEFAULT_SCALE;
  }
  logger.info("Setting video scale to " + scale);
  this.scale = scale;
  if (this.canvas) {
    this.updateCanvasSize();
    this.renderer.setScale(scale);
    return this.drawFrame();
  }
};

VideoManager.prototype.getScale = function() {
  return this.scale;
};

VideoManager.prototype.getMaxScale = function() {
  return ~~Math.min(screen.width / VIDEO_WIDTH, screen.height / VIDEO_HEIGHT);
};

VideoManager.prototype.setFullScreen = function(fullscreen) {
  if (fullscreen) {
    return this.enterFullScreen();
  } else {
    return this.leaveFullScreen();
  }
};

VideoManager.prototype.enterFullScreen = function() {
  if (screenfull.enabled && !this.isFullScreen()) {
    logger.info("Entering fullscreen");
    return screenfull.request(this.canvas);
  }
};

VideoManager.prototype.leaveFullScreen = function() {
  if (screenfull.enabled && this.isFullScreen()) {
    logger.info("Leaving fullscreen");
    return screenfull.exit();
  }
};

VideoManager.prototype.onFullscreenChange = function() {
  logger.info("Fullscreen " + (this.isFullScreen() ? 'enabled' : 'disabled'));
  if (this.isFullScreen()) {
    this.prevScale = this.scale;
    return this.setScale(this.getMaxScale());
  } else {
    this.setScale(this.prevScale);
    return this.prevScale = null;
  }
};

VideoManager.prototype.isFullScreen = function() {
  return screenfull.isFullscreen;
};

VideoManager.prototype.readConfiguration = function(config) {
  logger.info("Reading video manager configuration");
  if (config["video"]) {
    this.setDebugging(config["video"]["debugging"]);
    this.setSmoothing(config["video"]["smoothing"]);
    this.setScale(config["video"]["scale"]);
    this.setPalette(config["video"]["palette"]);
    return this.setRenderer(config["video"]["renderer"]);
  }
};

VideoManager.prototype.writeConfiguration = function(config) {
  logger.info("Writing video manager configuration");
  return config["video"] = {
    "debugging": this.isDebugging(),
    "smoothing": this.isSmoothing(),
    "scale": this.getScale(),
    "palette": this.getPalette(),
    "renderer": this.getRenderer()
  };
};

module.exports = VideoManager;
