import { BLACK_COLOR } from "../../core/utils/colors";
import { logger }      from "../../core/utils/logger";

const VERTEX_SHADER_SOURCE = "uniform   vec2 uScreenSize;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nvarying   vec2 vTextureCoord;\n\nvoid main(void) {\n    float x = aVertexPosition.x / (0.5 * uScreenSize.x) - 1.0; // [-1, 1] -> [0, width]\n    float y = 1.0 - aVertexPosition.y / (0.5 * uScreenSize.y); // [-1, 1] -> [height, 0]\n    gl_Position = vec4(x, y, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";

const FRAGMENT_SHADER_SOURCE = "precision mediump float;\n\nuniform sampler2D uSampler;\nvarying vec2      vTextureCoord;\n\nvoid main(void) {\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n}";

export function WebGLRenderer(canvas) {
  this.canvas = canvas;
  this.initWebGL();
  this.initParameters();
  this.initShaders();
};

WebGLRenderer.isSupported = function() {
  return window && window["WebGLRenderingContext"] != null;
};

WebGLRenderer.prototype.initWebGL = function() {
  var id, j, len, ref;
  if (!WebGLRenderer.isSupported()) {
    throw new Error("WebGL is not supported");
  }
  ref = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  for (j = 0, len = ref.length; j < len; j++) {
    id = ref[j];
    if (this.gl = this.getContext(id)) {
      break;
    }
  }
  if (!this.gl) {
    throw new Error("Unable to get WebGL context");
  }
};

WebGLRenderer.prototype.getContext = function(id) {
  var error;
  try {
    logger.info("Trying to get WebGL context '" + id + "'");
    return this.canvas.getContext(id);
  } catch (_error) {
    error = _error;
    logger.warn("Error when getting WebGL context '" + id + ": " + error + "'");
    return null;
  }
};

WebGLRenderer.prototype.initShaders = function() {
  var program;
  program = this.compileAndLinkShaders();
  this.screenSizeUniform = this.gl.getUniformLocation(program, "uScreenSize");
  this.samplerUniform = this.gl.getUniformLocation(program, "uSampler");
  this.vertexPositionAttribute = this.gl.getAttribLocation(program, "aVertexPosition");
  this.textureCoordAttribute = this.gl.getAttribLocation(program, "aTextureCoord");
  this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
  this.gl.enableVertexAttribArray(this.textureCoordAttribute);
  return this.gl.useProgram(program);
};

WebGLRenderer.prototype.compileAndLinkShaders = function() {
  var program;
  program = this.gl.createProgram();
  this.gl.attachShader(program, this.compileShadder(this.gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
  this.gl.attachShader(program, this.compileShadder(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
  this.gl.linkProgram(program);
  if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
    throw new Error("Shader linking error");
  }
  return program;
};

WebGLRenderer.prototype.compileShadder = function(type, source) {
  var shader;
  shader = this.gl.createShader(type);
  this.gl.shaderSource(shader, source);
  this.gl.compileShader(shader);
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    throw new Error("Shader compilation error: " + (this.gl.getShaderInfoLog(shader)));
  }
  return shader;
};

WebGLRenderer.prototype.createFrame = function(x, y, width, height) {
  width = this.roundUpToPowerOf2(width);
  height = this.roundUpToPowerOf2(height);
  return {
    width: width,
    height: height,
    data: this.createFrameData(width, height),
    verticies: this.createFrameVerticies(x, y, width, height),
    coords: this.createFrameCoords(),
    texture: this.gl.createTexture()
  };
};

WebGLRenderer.prototype.roundUpToPowerOf2 = function(number) {
  var result;
  result = 1;
  while (result < number) {
    result *= 2;
  }
  return result;
};

WebGLRenderer.prototype.createFrameData = function(width, height) {
  var buffer, data, i, j, ref;
  buffer = new ArrayBuffer(width * height * 4);
  data = new Uint32Array(buffer);
  for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    data[i] = BLACK_COLOR;
  }
  return data;
};

WebGLRenderer.prototype.createFrameVerticies = function(x, y, width, height) {
  var verticiesBuffer, verticiesData;
  verticiesData = new Float32Array([x, y, x + width, y, x + width, y + height, x, y + height]);
  verticiesBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticiesBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, verticiesData, this.gl.STATIC_DRAW);
  return verticiesBuffer;
};

WebGLRenderer.prototype.createFrameCoords = function() {
  var coordsBuffer, coordsData;
  coordsData = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
  coordsBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, coordsBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, coordsData, this.gl.STATIC_DRAW);
  return coordsBuffer;
};

WebGLRenderer.prototype.drawFrame = function(frame) {
  this.updateFrameTexture(frame);
  this.updateShaderParameters(frame);
  return this.drawFrameVerticies(frame);
};

WebGLRenderer.prototype.updateFrameTexture = function(frame) {
  var data, filter;
  filter = this.smoothing ? this.gl.LINEAR : this.gl.NEAREST;
  data = new Uint8Array(frame.data.buffer);
  this.gl.activeTexture(this.gl.TEXTURE0);
  this.gl.bindTexture(this.gl.TEXTURE_2D, frame.texture);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
  return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, frame.width, frame.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
};

WebGLRenderer.prototype.updateShaderParameters = function(frame) {
  this.gl.uniform1i(this.samplerUniform, 0);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.verticies);
  this.gl.vertexAttribPointer(this.vertexPositionAttribute, 2, this.gl.FLOAT, false, 0, 0);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.coords);
  return this.gl.vertexAttribPointer(this.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
};

WebGLRenderer.prototype.drawFrameVerticies = function(frame) {
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.verticies);
  return this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
};

WebGLRenderer.prototype.begin = function() {
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  return this.gl.uniform2f(this.screenSizeUniform, this.canvas.width / this.scale, this.canvas.height / this.scale);
};

WebGLRenderer.prototype.end = function() {
  return this.gl.flush();
};

WebGLRenderer.prototype.initParameters = function() {
  this.smoothing = false;
  return this.scale = 1;
};

WebGLRenderer.prototype.setScale = function(scale) {
  return this.scale = scale;
};

WebGLRenderer.prototype.setSmoothing = function(smoothing) {
  return this.smoothing = smoothing;
};
