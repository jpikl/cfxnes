import log from '../../../core/src/common/log';
import {assert} from '../../../core/src/common/utils';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../core/src/video/constants';
import {isPaletteName, createPalette} from '../../../core/src/video/palettes';
import Fullscreen from './Fullscreen';
import {isRendererName, createRenderer} from './renderers';
import {isFullscreenStyle, applyFullscreenStyle, removeFullscreenStyle} from './canvas';

const {addEventListener} = window;

export default class Video {

  constructor(nes) {
    log.info('Initializing video');

    this.nes = nes;
    this.fullscreen = new Fullscreen;
    this.fullscreen.on('change', () => this.onFullscreenChange());

    this.setOutput(null);
    this.setRenderer('webgl');
    this.setPalette('fceux');
    this.setScale(1);
    this.setSmoothing(false);
    this.setDebug(false);
    this.setFullscreenType('maximized');

    addEventListener('deviceorientation', () => this.onResolutionChange());
    addEventListener('resize', () => this.onResolutionChange());
  }

  //=========================================================
  // Events
  //=========================================================

  onResolutionChange() {
    if (this.isFullscreen()) {
      log.info('Updating fullscreeen canvas after resolution change');
      this.updateRenderer();
      this.updateSize();
      this.updateStyle();
      this.drawFrame();
    }
  }

  onFullscreenChange() {
    if (this.canvas) {
      log.info('Updating canvas after fullscreen change');
      this.updateRenderer();
      this.updateSize();
      this.updateStyle();
      this.drawFrame();
    }
  }

  //=========================================================
  // Output
  //=========================================================

  setOutput(canvas) {
    assert(canvas === null || canvas instanceof HTMLCanvasElement, 'Invalid video output');
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
  // Canvas
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
    return VIDEO_WIDTH * (this.debug ? 2 : 1);
  }

  getBaseHeight() {
    return VIDEO_HEIGHT;
  }

  //=========================================================
  // Renderer
  //=========================================================

  setRenderer(name) {
    assert(isRendererName(name), 'Invalid video renderer');
    if (this.rendererName !== name) {
      assert(this.canvas == null, 'Cannot change video renderer once output is set');
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
    if (this.debug) {
      this.nes.renderDebugFrame(this.debugFrame.data);
    }
  }

  drawFrame() {
    this.renderer.begin();
    this.renderer.drawFrame(this.frame);
    if (this.debug) {
      this.renderer.drawFrame(this.debugFrame);
    }
    this.renderer.end();
  }

  //=========================================================
  // Palette
  //=========================================================

  setPalette(name) {
    assert(isPaletteName(name), 'Invalid video palette');
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
    assert(typeof scale === 'number' && scale > 0, 'Invalid video scale');
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
    const maxHorizontalScale = window.innerWidth / this.getBaseWidth();
    const maxVerticalScale = window.innerHeight / this.getBaseHeight();
    return Math.min(maxHorizontalScale, maxVerticalScale);
  }

  //=========================================================
  // Smoothing
  //=========================================================

  setSmoothing(smoothing) {
    assert(typeof smoothing === 'boolean', 'Invalid video smoothing');
    if (this.smoothing !== smoothing) {
      log.info(`Setting video smoothing to ${smoothing ? 'on' : 'off'}`);
      this.smoothing = smoothing;
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
  // Debug
  //=========================================================

  setDebug(debug) {
    assert(typeof debug === 'boolean', 'Invalid video debug');
    if (this.debug !== debug) {
      log.info(`Setting video debug to ${debug ? 'on' : 'off'}`);
      this.debug = debug;
      if (this.canvas) {
        this.updateRenderer();
        this.updateSize();
        this.updateStyle();
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  isDebug() {
    return this.debug;
  }

  //=========================================================
  // Fullscreen
  //=========================================================

  enterFullscreen() {
    assert(this.canvas != null, 'No video output');
    return this.fullscreen.enter(this.canvas.parentElement);
  }

  exitFullscreen() {
    return this.fullscreen.exit();
  }

  isFullscreen() {
    return this.fullscreen.is();
  }

  setFullscreenType(type) {
    assert(isFullscreenStyle(type), 'Invalid fullscreen type');
    if (this.fullscreenType !== type) {
      log.info(`Setting fullsreen type to "${type}"`);
      this.fullscreenType = type;
      if (this.isFullscreen()) {
        this.updateStyle();
      }
    }
  }

  getFullscreenType() {
    return this.fullscreenType;
  }

}
