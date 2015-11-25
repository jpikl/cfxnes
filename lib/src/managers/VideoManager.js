// jscs:disable requireDotNotation, requireDotNotation

import logger from '../../../core/src/utils/logger';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from '../../../core/src/common/constants';
import { copyProperties } from '../../../core/src/utils/objects';

var fullscreenStyle = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  margin: 'auto',
  width: 'auto',
  height: 'auto',
};

//=========================================================
// Video manager
//=========================================================

export default class VideoManager {

  constructor() {
    this.dependencies = ['nes', 'rendererFactory', 'paletteFactory', 'screenfull'];
  }

  inject(nes, rendererFactory, paletteFactory, screenfull) {
    logger.info('Initializing video manager');
    this.nes = nes;
    this.rendererFactory = rendererFactory;
    this.paletteFactory = paletteFactory;
    this.screenfull = screenfull;
    this.initListeners();
    this.setDefaults();
  }

  initListeners() {
    if (this.screenfull) {
      document.addEventListener(this.screenfull.raw.fullscreenchange, () => this.onFullscreenChange());
    }
    window.addEventListener('deviceorientation',  () => this.onResolutionChange());
    window.addEventListener('resize',  () => this.onResolutionChange());
  }

  setDefaults() {
    logger.info('Using default video configuration');
    this.setDebugging();
    this.setSmoothing();
    this.setScale();
    this.setPalette();
    this.setRenderer();
    this.setFullscreenMode();
  }

  //=========================================================
  // Canvas
  //=========================================================

  setCanvas(canvas) {
    logger.info(`Setting video output to ${canvas}`);
    this.canvas = canvas;
    if (this.canvas) {
      this.createRenderer();
      this.updateRendererParams();
      this.updateCanvasSize();
      this.updateCanvasStyle();
      this.drawFrame();
    }
  }

  updateCanvasSize() {
    this.canvas.width = this.getTargetScale() * VIDEO_WIDTH * this.getWidthMultiplier();
    this.canvas.height = this.getTargetScale() * VIDEO_HEIGHT;
  }

  updateCanvasStyle() {
    var style = this.canvas.style;
    if (this.isFullscreen()) {
      copyProperties(fullscreenStyle, style);
      var flags = this.fullscreenMode.split('|');
      if (flags.indexOf('fill-screen') >= 0) {
        style.width = '100%';
        style.height = '100%';
        if (flags.indexOf('keep-aspect-ratio') >= 0) {
          var ratio = this.canvas.width / this.canvas.height;
          if (screen.height * ratio > screen.width) {
            style.height = 'auto';
          } else {
            style.width = 'auto';
          }
        }
      }
    } else {
      for (var property of Object.keys(fullscreenStyle)) {
        style.removeProperty(property);
      }
    }
  }

  getOutputRect() {
    if (this.canvas) {
      var rect = this.getCanvasRect();
      if (this.debugging) {
        rect.right -= (rect.right - rect.left) / 2; // Without debugging output
      }
      return rect;
    } else {
      return this.getEmptyRect();
    }
  }

  getCanvasRect() {
    var rect = this.canvas.getBoundingClientRect(); // Read-only, we need a writable copy
    return {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left};
  }

  getEmptyRect() {
    return {top: -1, right: -1, bottom: -1, left: -1};
  }

  onResolutionChange() {
    if (this.canvas) {
      this.updateRendererParams();
      this.updateCanvasSize();
      this.updateCanvasStyle();
      this.drawFrame();
    }
  }

  //=========================================================
  // Renderering
  //=========================================================

  isRendererSupported(id) {
    return this.rendererFactory.isRendererSupported(id);
  }

  setRenderer(id = 'webgl') {
    if (this.rendererId !== id) {
      logger.info(`Using "${id}" video renderer`);
      this.rendererId = id;
      if (this.canvas) {
        this.createRenderer();
        this.updateRendererParams();
      }
    }
  }

  getRenderer() {
    return this.rendererId;
  }

  createRenderer() {
    this.renderer = this.rendererFactory.createRenderer(this.rendererId, this.canvas);
    this.frame = this.renderer.createFrame(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    this.debugFrame = this.renderer.createFrame(VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  updateRendererParams() {
    this.renderer.setSmoothing(this.smoothing);
    this.renderer.setScale(this.getTargetScale());
  }

  renderFrame() {
    this.nes.renderFrame(this.frame.data);
    if (this.debugging) {
      this.nes.renderDebugFrame(this.debugFrame.data);
    }
  }

  drawFrame() {
    this.renderer.begin();
    this.renderer.drawFrame(this.frame);
    if (this.debugging) {
      this.renderer.drawFrame(this.debugFrame);
    }
    this.renderer.end();
  }

  //=========================================================
  // Palette
  //=========================================================

  setPalette(id = 'fceux') {
    if (this.paletteId !== id) {
      logger.info(`Setting video palette to "${id}"`);
      this.paletteId = id;
      this.nes.setPalette(this.paletteFactory.createPalette(id));
      if (this.canvas) {
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  getPalette() {
    return this.paletteId;
  }

  //=========================================================
  // Debugging
  //=========================================================

  setDebugging(enabled = false) {
    if (this.debugging !== enabled) {
      logger.info(`Setting video debugging to ${enabled ? 'on' : 'off'}`);
      this.debugging = enabled;
      if (this.canvas) {
        this.updateRendererParams();
        this.updateCanvasSize();
        this.updateCanvasStyle();
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  isDebugging() {
    return this.debugging;
  }

  getWidthMultiplier() {
    return this.debugging ? 2 : 1;
  }

  //=========================================================
  // Smoothing
  //=========================================================

  setSmoothing(enabled = false) {
    if (this.smoothing !== enabled) {
      logger.info(`Setting video smoothing to ${enabled ? 'on' : 'off'}`);
      this.smoothing = enabled;
      if (this.canvas) {
        this.updateRendererParams();
        this.drawFrame();
      }
    }
  }

  isSmoothing() {
    return this.smoothing;
  }

  //=========================================================
  // Scalling
  //=========================================================

  setScale(scale = 1) {
    if (this.scale !== scale && scale >= 1 && (scale <= this.getMaxScale() || (this.scale && scale < this.scale))) {
      logger.info(`Setting video scale to ${scale}`);
      this.scale = scale;
      if (this.canvas) {
        this.updateRendererParams();
        this.updateCanvasSize();
        this.updateCanvasStyle();
        this.drawFrame();
      }
    }
  }

  getScale() {
    return this.scale;
  }

  getTargetScale() {
    return this.isFullscreen() ? this.getMaxScale() : this.scale;
  }

  getMaxScale() {
    var maxHorizontalScale = screen.width / (VIDEO_WIDTH * this.getWidthMultiplier());
    var maxVerticalScale = screen.height / VIDEO_HEIGHT;
    return Math.max(1, ~~Math.min(maxHorizontalScale, maxVerticalScale));
  }

  //=========================================================
  // Fullscreen
  //=========================================================

  setFullscreen(fullscreen) {
    if (fullscreen) {
      this.enterFullscreen();
    } else {
      this.leaveFullscreen();
    }
  }

  enterFullscreen() {
    this.checkScreenfullAvailable();
    if (this.screenfull.enabled && !this.isFullscreen()) {
      logger.info('Entering fullscreen');
      this.screenfull.request(this.canvas.parentElement);
    }
  }

  leaveFullscreen() {
    this.checkScreenfullAvailable();
    if (this.screenfull.enabled && this.isFullscreen()) {
      logger.info('Leaving fullscreen');
      this.screenfull.exit();
    }
  }

  onFullscreenChange() {
    logger.info(`Fullscreen ${this.isFullscreen() ? 'enabled' : 'disabled'}`);
    this.updateRendererParams();
    this.updateCanvasSize();
    this.updateCanvasStyle();
    this.drawFrame();
  }

  isFullscreen() {
    return this.screenfull && this.screenfull.isFullscreen;
  }

  setFullscreenMode(mode = 'fill-screen|keep-aspect-ratio') {
    if (this.fullscreenMode !== mode) {
      logger.info(`Setting fullsreen mode to "${mode}"`);
      this.fullscreenMode = mode;
      if (this.canvas) {
        this.updateCanvasStyle();
      }
    }
  }

  getFullscreenMode() {
    return this.fullscreenMode;
  }

  checkScreenfullAvailable() {
    if (this.screenfull == null) {
      throw new Error('Unable to switch fullscreen: screenfull library is not available.');
    }
  }

  //=========================================================
  // Configuration
  //=========================================================

  readConfiguration(config) {
    config['videoDebugging'] = this.isDebugging();
    config['videoSmoothing'] = this.isSmoothing();
    config['videoScale'] = this.getScale();
    config['videoPalette'] = this.getPalette();
    config['videoRenderer'] = this.getRenderer();
    config['fullscreenMode'] = this.getFullscreenMode();

  }

  writeConfiguration(config) {
    if (config['videoDebugging'] !== undefined) this.setDebugging(config['videoDebugging']);
    if (config['videoSmoothing'] !== undefined) this.setSmoothing(config['videoSmoothing']);
    if (config['videoScale'] !== undefined) this.setScale(config['videoScale']);
    if (config['videoPalette'] !== undefined) this.setPalette(config['videoPalette']);
    if (config['videoRenderer'] !== undefined) this.setRenderer(config['videoRenderer']);
    if (config['fullscreenMode'] !== undefined) this.setFullscreenMode(config['fullscreenMode']);
  }

}
