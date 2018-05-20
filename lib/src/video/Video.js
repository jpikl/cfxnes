import {log, describe, isPaletteName, createPalette, DEFAULT_PALETTE, VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../core';
import {isStyleName, applyStyle, removeStyle, MAXIMIZED} from './styles';
import {isRendererName, createRenderer, WEBGL} from './renderers';
import {isFilter, NEAREST} from './filters';
import Fullscreen from './Fullscreen';

export default class Video {

  constructor(nes) {
    log.info('Initializing video');

    this.nes = nes;
    this.canvas = null; // Rendering target
    this.renderer = null; // Current renderer
    this.rendererName = WEBGL; // Name of current renderer
    this.paletteName = DEFAULT_PALETTE; // Name of current palette
    this.frame = null; // Frame to render standard output
    this.debugFrame = null; // Frame to render debug output
    this.scale = 1; // Canvas scale factor
    this.filter = NEAREST; // Type of video filter
    this.debug = false; // Whether debug output is enabled
    this.fullscreenType = MAXIMIZED; // Type of fullscreen mode
    this.fullscreen = new Fullscreen;
    this.fullscreen.on('change', () => this.onFullscreenChange());

    this.applyPalette();

    if (location.protocol === 'https:') { // Deprecated for insecure origins
      window.addEventListener('deviceorientation', () => this.onResolutionChange());
    }
    window.addEventListener('resize', () => this.onResolutionChange());
  }

  //=========================================================
  // Events
  //=========================================================

  onResolutionChange() {
    if (this.isFullscreen()) {
      log.info('Updating fullscreen canvas after resolution change');
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
    if (canvas !== null && !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Invalid video output: ' + describe(canvas));
    }

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
      applyStyle(this.canvas, this.fullscreenType);
    } else {
      removeStyle(this.canvas);
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
    if (!isRendererName(name)) {
      throw new Error('Invalid video renderer: ' + describe(name));
    }
    if (this.rendererName !== name) {
      if (this.canvas) {
        throw new Error('Cannot change video renderer once output is set');
      }
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
    this.renderer.setFilter(this.filter);
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

  clearFrame() {
    if (this.canvas == null) {
      throw new Error('No video output');
    }
    this.nes.renderEmptyFrame(this.frame.data);
    if (this.debug) {
      this.nes.renderEmptyFrame(this.debugFrame.data);
    }
    this.drawFrame();
  }

  //=========================================================
  // Palette
  //=========================================================

  setPalette(name) {
    if (!isPaletteName(name)) {
      throw new Error('Invalid video palette: ' + describe(name));
    }

    if (this.paletteName !== name) {
      log.info(`Setting video palette to "${name}"`);

      this.paletteName = name;
      this.applyPalette();

      if (this.canvas) {
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  applyPalette() {
    this.nes.setPalette(createPalette(this.paletteName));
  }

  getPalette() {
    return this.paletteName;
  }

  //=========================================================
  // Scale
  //=========================================================

  setScale(scale) {
    if (typeof scale !== 'number' || scale <= 0) {
      throw new Error('Invalid video scale: ' + describe(scale));
    }

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
    return this.isFullscreen() ? this.getFullscreenScale() : this.scale;
  }

  getFullscreenScale() {
    const horizontalScale = window.innerWidth / this.getBaseWidth();
    const verticalScale = window.innerHeight / this.getBaseHeight();
    const scale = Math.min(horizontalScale, verticalScale);
    return scale > 1 ? ~~scale : scale;
  }

  //=========================================================
  // Filter
  //=========================================================

  setFilter(filter) {
    if (!isFilter(filter)) {
      throw new Error('Invalid video filter: ' + describe(filter));
    }

    if (this.filter !== filter) {
      log.info(`Setting video filter to "${filter}"`);
      this.filter = filter;

      if (this.canvas) {
        this.updateRenderer();
        this.drawFrame();
      }
    }
  }

  getFilter() {
    return this.filter;
  }

  //=========================================================
  // Debug
  //=========================================================

  setDebug(debug) {
    if (typeof debug !== 'boolean') {
      throw new Error('Invalid video debug: ' + describe(debug));
    }

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
    if (this.canvas == null) {
      throw new Error('No video output');
    }
    return this.fullscreen.enter(this.canvas.parentElement);
  }

  exitFullscreen() {
    return this.fullscreen.exit();
  }

  isFullscreen() {
    return this.fullscreen.is();
  }

  setFullscreenType(type) {
    if (!isStyleName(type)) {
      throw new Error('Invalid fullscreen type: ' + describe(type));
    }

    if (this.fullscreenType !== type) {
      log.info(`Setting fullscreen type to "${type}"`);
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
