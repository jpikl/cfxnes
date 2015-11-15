// jscs:disable requireDotNotation

import { fillArray } from '../../../core/src/utils/arrays';
import { BLACK_COLOR } from '../../../core/src/utils/colors';

//=========================================================
// Renderer using canvas API
//=========================================================

export default class CanvasRenderer {

  static ['isSupported']() { // TODO use regular name when closure compiler properly supports static methods
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
    var imageData = this.context.createImageData(width, height);
    var data = new Uint32Array(imageData.data.buffer);
    fillArray(data, BLACK_COLOR);
    return { x, y, data, imageData };
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
    var sw = this.canvas.width / this.scale;
    var sh = this.canvas.height / this.scale;
    var dw = this.canvas.width;
    var dh = this.canvas.height;
    this.context.drawImage(this.canvas, 0, 0, sw, sh, 0, 0, dw, dh);
  }

}
