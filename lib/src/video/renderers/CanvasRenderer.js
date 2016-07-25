import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../../core/src/video/constants';
import {BLACK_COLOR} from '../../../../core/src/video/colors';
import log from '../../../../core/src/common/log';

//=========================================================
// Context
//=========================================================

let auxContext;

function getAuxContext() {
  if (auxContext == null) {
    log.info('Creating auxiliary canvas');
    const canvas = document.createElement('canvas');
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    auxContext = getContext(canvas);
  }
  return auxContext;
}

function getContext(canvas) {
  log.info('Getting 2d canvas context');
  const context = canvas.getContext('2d', {alpha: false});
  if (context == null) {
    throw new Error('Unable to get canvas 2d context');
  }
  return context;
}

//=========================================================
// Renderer
//=========================================================

export default class CanvasRenderer {

  static ['isSupported']() { // Closure compiler bug #1776 workaround
    return true;
  }

  constructor(canvas) {
    this.context = getContext(canvas);
    this.smoothing = false;
    this.scale = 1;
  }

  //=========================================================
  // Frame
  //=========================================================

  createFrame(x, y, width, height) {
    const image = this.context.createImageData(width, height);
    const data = new Uint32Array(image.data.buffer).fill(BLACK_COLOR);
    return {x, y, data, image};
  }

  drawFrame(frame) {
    const context = this.scale !== 1 ? getAuxContext() : this.context;
    context.putImageData(frame.image, frame.x, frame.y);
  }

  //=========================================================
  // Begin / End
  //=========================================================

  begin() {
  }

  end() {
    if (this.scale !== 1) {
      this.applySmoothing();
      this.appyScaling();
    }
  }

  //=========================================================
  // Smoothing
  //=========================================================

  setSmoothing(smoothing) {
    this.smoothing = smoothing;
  }

  applySmoothing() {
    this.context['imageSmoothingEnabled'] = this.smoothing;
    this.context['mozImageSmoothingEnabled'] = this.smoothing;
    this.context['oImageSmoothingEnabled'] = this.smoothing;
    this.context['msImageSmoothingEnabled'] = this.smoothing;
  }

  //=========================================================
  // Scaling
  //=========================================================

  setScale(scale) {
    this.scale = scale;
  }

  appyScaling() {
    const src = getAuxContext().canvas;
    const dst = this.context.canvas;
    this.context.drawImage(src, 0, 0, src.width, src.height, 0, 0, dst.width, dst.height);
  }

}
