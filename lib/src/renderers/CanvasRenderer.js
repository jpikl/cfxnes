import {BLACK_COLOR} from '../../../core/src/video/colors';

export default class CanvasRenderer {

  static ['isSupported']() { // Closure compiler bug #1776 workaround
    return true;
  }

  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.smoothing = false;
    this.scale = 1;
  }

  //=========================================================
  // Frame
  //=========================================================

  createFrame(x, y, width, height) {
    const imageData = this.context.createImageData(width, height);
    const data = new Uint32Array(imageData.data.buffer).fill(BLACK_COLOR);
    return {x, y, data, imageData};
  }

  drawFrame(frame) {
    this.context.putImageData(frame.imageData, frame.x, frame.y);
  }

  //=========================================================
  // Begin / End
  //=========================================================

  begin() {
  }

  end() {
    if (this.scale > 1) {
      this.applySmoothing();
      this.appyScaling();
    }
  }

  //=========================================================
  // Parameters
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

  setScale(scale) {
    this.scale = scale;
  }

  appyScaling() {
    const sw = this.canvas.width / this.scale;
    const sh = this.canvas.height / this.scale;
    const dw = this.canvas.width;
    const dh = this.canvas.height;
    this.context.drawImage(this.canvas, 0, 0, sw, sh, 0, 0, dw, dh);
  }

}
