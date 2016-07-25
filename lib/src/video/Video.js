import log from '../../../core/src/common/log';
import {assert} from '../../../core/src/common/utils';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../core/src/video/constants';
import {createPalette} from '../../../core/src/video/palettes';
import Options from '../data/Options';
import {createRenderer} from './renderers';
import {applyFullscreenStyle, removeFullscreenStyle} from './styles';

export default class Video {

  constructor(nes, {screenfull}) {
    log.info('Initializing video');
    this.nes = nes;
    this.screenfull = screenfull;
    this.initListeners();
    this.initOptions();
  }

  initListeners() {
    if (this.screenfull) {
      document.addEventListener(this.screenfull.raw.fullscreenchange, () => this.onFullscreenChange());
    }
    window.addEventListener('deviceorientation', () => this.onResolutionChange());
    window.addEventListener('resize', () => this.onResolutionChange());
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('videoRenderer', this.setRenderer, this.getRenderer, 'webgl');
    this.options.add('videoPalette', this.setPalette, this.getPalette, 'fceux');
    this.options.add('videoScale', this.setScale, this.getScale, 1);
    this.options.add('videoSmoothing', this.setSmoothing, this.isSmoothing, false);
    this.options.add('videoDebugging', this.setDebugging, this.isDebugging, false);
    this.options.add('fullscreenType', this.setFullscreenType, this.getFullscreenType, 'maximized');
    this.options.reset();
  }

  //=========================================================
  // Events
  //=========================================================

  onResolutionChange() {
    if (this.isFullscreen()) {
      log.info('Updating canvas due to resolution change');
      this.updateRenderer();
      this.updateSize();
      this.updateStyle();
      this.drawFrame();
    }
  }

  onFullscreenChange() {
    log.info(`Fullscreen ${this.isFullscreen() ? 'enabled' : 'disabled'}`);
    this.updateRenderer();
    this.updateSize();
    this.updateStyle();
    this.drawFrame();
  }

  //=========================================================
  // Output
  //=========================================================

  setOutput(canvas) {
    assert(canvas == null || canvas instanceof HTMLCanvasElement);

    log.info(`Setting video output to ${canvas}`);
    this.canvas = canvas;
    if (canvas) {
      this.createRenderer();
      this.updateRenderer();
      this.updateSize();
      this.updateStyle();
      this.drawFrame();
    }
  }

  getOutput() {
    return this.canvas;
  }

  getOutputRect() {
    return this.canvas ? this.canvas.getBoundingClientRect() : null;
  }

  getOutputCoordinates(cursorX, cursorY) {
    if (this.canvas) {
      const {width, height, top, left} = this.getOutputRect();
      const horizontalScale = width / this.getBaseWidth();
      const verticalScale = height / this.getBaseHeight();
      const screenX = ~~((cursorX - left) / horizontalScale);
      const screenY = ~~((cursorY - top) / verticalScale);
      return [screenX, screenY];
    }
    return null;
  }

  //=========================================================
  // Display
  //=========================================================

  updateSize() {
    this.canvas.width = this.getTargetScale() * this.getBaseWidth();
    this.canvas.height = this.getTargetScale() * this.getBaseHeight();
    log.info(`Canvas resized to ${this.canvas.width}x${this.canvas.height} px`);
  }

  updateStyle() {
    if (this.isFullscreen()) {
      applyFullscreenStyle(this.canvas, this.fullscreenType);
    } else {
      removeFullscreenStyle(this.canvas);
    }
  }

  getBaseWidth() {
    return VIDEO_WIDTH * (this.debugging ? 2 : 1);
  }

  getBaseHeight() {
    return VIDEO_HEIGHT;
  }

  //=========================================================
  // Renderer
  //=========================================================

  setRenderer(name) {
    if (this.rendererName !== name) {
      assert(this.canvas == null, 'Unable to change renderer, the canvas context is already initialized');
      log.info(`Using "${name}" video renderer`);
      this.rendererName = name;
    }
  }

  getRenderer() {
    return this.rendererName;
  }

  createRenderer() {
    this.renderer = createRenderer(this.rendererName, this.canvas);
    this.frame = this.renderer.createFrame(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    this.debugFrame = this.renderer.createFrame(VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  updateRenderer() {
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

  setPalette(name) {
    if (this.paletteName !== name) {
      log.info(`Setting video palette to "${name}"`);
      this.paletteName = name;
      this.nes.setPalette(createPalette(name));
      if (this.canvas) {
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  getPalette() {
    return this.paletteName;
  }

  //=========================================================
  // Scale
  //=========================================================

  setScale(scale) {
    if (this.scale !== scale) {
      log.info(`Setting video scale to ${scale}`);
      this.scale = scale;
      if (this.canvas) {
        this.updateRenderer();
        this.updateSize();
        this.updateStyle();
        this.drawFrame();
      }
    }
  }

  getScale() {
    return this.scale;
  }

  getTargetScale() {
    if (this.isFullscreen()) {
      const maxScale = this.getMaxScale();
      return maxScale > 1 ? ~~maxScale : maxScale;
    }
    return this.scale;
  }

  getMaxScale() {
    const maxHorizontalScale = screen.width / this.getBaseWidth();
    const maxVerticalScale = screen.height / this.getBaseHeight();
    return Math.min(maxHorizontalScale, maxVerticalScale);
  }

  //=========================================================
  // Smoothing
  //=========================================================

  setSmoothing(enabled) {
    if (this.smoothing !== enabled) {
      log.info(`Setting video smoothing to ${enabled ? 'on' : 'off'}`);
      this.smoothing = enabled;
      if (this.canvas) {
        this.updateRenderer();
        this.drawFrame();
      }
    }
  }

  isSmoothing() {
    return this.smoothing;
  }

  //=========================================================
  // Debugging
  //=========================================================

  setDebugging(enabled) {
    if (this.debugging !== enabled) {
      log.info(`Setting video debugging to ${enabled ? 'on' : 'off'}`);
      this.debugging = enabled;
      if (this.canvas) {
        this.updateRenderer();
        this.updateSize();
        this.updateStyle();
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  isDebugging() {
    return this.debugging;
  }

  //=========================================================
  // Full screen
  //=========================================================

  enterFullscreen() {
    assert(this.screenfull != null, 'Unable to switch to fullscreen: screenfull library is not available');
    assert(this.canvas != null, 'Unable to switch to fullscreen: no canvas was set as video output');

    if (this.screenfull.enabled && !this.isFullscreen()) {
      log.info('Entering fullscreen');
      this.screenfull.request(this.canvas.parentElement);
    }
  }

  isFullscreen() {
    return this.screenfull && this.screenfull.isFullscreen;
  }

  setFullscreenType(type) {
    if (this.fullscreenType !== type) {
      log.info(`Setting fullsreen type to "${type}"`);
      this.fullscreenType = type;
      if (this.canvas) {
        this.updateStyle();
      }
    }
  }

  getFullscreenType() {
    return this.fullscreenType;
  }

}
