var colors;

colors = require("../../core/utils/colors");

CanavsRenderer.isSupported = function() {
  return true;
};

function CanavsRenderer(canvas) {
  this.canvas = canvas;
  this.context = this.canvas.getContext("2d");
  this.initParameters();
}

CanavsRenderer.prototype.createFrame = function(x, y, width, height) {
  var data, i, imageData, j, ref;
  imageData = this.context.createImageData(width, height);
  data = new Uint32Array(imageData.data.buffer);
  for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    data[i] = colors.BLACK;
  }
  return {
    x: x,
    y: y,
    data: data,
    imageData: imageData
  };
};

CanavsRenderer.prototype.drawFrame = function(frame) {
  return this.context.putImageData(frame.imageData, frame.x, frame.y);
};

CanavsRenderer.prototype.begin = function() {};

CanavsRenderer.prototype.end = function() {
  if (this.scale > 1) {
    this.applySmoothing();
    return this.appyScaling();
  }
};

CanavsRenderer.prototype.initParameters = function() {
  this.smoothing = false;
  return this.scale = 1;
};

CanavsRenderer.prototype.setSmoothing = function(smoothing) {
  return this.smoothing = smoothing;
};

CanavsRenderer.prototype.applySmoothing = function() {
  this.context["imageSmoothingEnabled"] = this.smoothing;
  this.context["mozImageSmoothingEnabled"] = this.smoothing;
  this.context["oImageSmoothingEnabled"] = this.smoothing;
  this.context["webkitImageSmoothingEnabled"] = this.smoothing;
  return this.context["msImageSmoothingEnabled"] = this.smoothing;
};

CanavsRenderer.prototype.setScale = function(scale) {
  return this.scale = scale;
};

CanavsRenderer.prototype.appyScaling = function() {
  var dh, dw, sh, sw;
  sw = this.canvas.width / this.scale;
  sh = this.canvas.height / this.scale;
  dw = this.canvas.width;
  dh = this.canvas.height;
  return this.context.drawImage(this.canvas, 0, 0, sw, sh, 0, 0, dw, dh);
};

module.exports = CanavsRenderer;
