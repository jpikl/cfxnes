import {BLACK_COLOR} from '../../../../core/src/video/colors';
import {roundUpToPow2} from '../../../../core/src/common/utils';
import log from '../../../../core/src/common/log';

//=========================================================
// Shader sources
//=========================================================

const VERTEX_SHADER_SOURCE = `
  uniform vec2 uScreenSize;
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;
  varying vec2 vTextureCoord;

  void main(void) {
    float x = aVertexPosition.x / (0.5 * uScreenSize.x) - 1.0; // [0, width] -> [-1, 1]
    float y = 1.0 - aVertexPosition.y / (0.5 * uScreenSize.y); // [height, 0] -> [-1, 1]
    gl_Position = vec4(x, y, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;

  uniform sampler2D uSampler;
  varying vec2 vTextureCoord;

  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

//=========================================================
// Renderer
//=========================================================

export default class WebGLRenderer {

  static ['isSupported']() { // Closure compiler bug #1776 workaround
    return window.WebGLRenderingContext != null;
  }

  constructor(canvas) {
    this.initContext(canvas);
    this.initShaders();
    this.initParams();
  }

  initContext(canvas) {
    if (!WebGLRenderer.isSupported()) {
      throw new Error('WebGL is not supported');
    }
    for (const name of ['webgl', 'experimental-webgl']) {
      log.info(`Getting ${name} canvas context`);
      this.gl = canvas.getContext(name, {alpha: false, depth: false, antialias: false});
      if (this.gl) {
        return;
      }
    }
    throw new Error('Unable to get webgl or experimental-webgl canvas context');
  }

  //=========================================================
  // Shaders
  //=========================================================

  initShaders() {
    const program = this.compileAndLinkShaders();
    this.screenSizeUniform = this.gl.getUniformLocation(program, 'uScreenSize');
    this.samplerUniform = this.gl.getUniformLocation(program, 'uSampler');
    this.vertexPositionAttribute = this.gl.getAttribLocation(program, 'aVertexPosition');
    this.textureCoordAttribute = this.gl.getAttribLocation(program, 'aTextureCoord');
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    this.gl.enableVertexAttribArray(this.textureCoordAttribute);
    this.gl.useProgram(program);
  }

  compileAndLinkShaders() {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, this.compileShadder(this.gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
    this.gl.attachShader(program, this.compileShadder(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error('Shader linking error');
    }
    return program;
  }

  compileShadder(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(`Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  //=========================================================
  // Frame - creation
  //=========================================================

  createFrame(x, y, width, height) {
    width = roundUpToPow2(width);
    height = roundUpToPow2(height);
    const data = this.createFrameData(width, height);
    const verticies = this.createFrameVerticies(x, y, width, height);
    const coords = this.createFrameCoords();
    const texture = this.gl.createTexture();
    return {width, height, data, verticies, coords, texture};
  }

  createFrameData(width, height) {
    return new Uint32Array(width * height).fill(BLACK_COLOR);
  }

  createFrameVerticies(x, y, width, height) {
    const data = new Float32Array([
      x, y,                  // Bottom left
      x + width, y,          // Bottom right
      x + width, y + height, // Top right
      x, y + height,         // Top left
    ]);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  createFrameCoords() {
    const data = new Float32Array([
      0.0, 0.0, // Bottom left
      1.0, 0.0, // Bottom right
      1.0, 1.0, // Top right
      0.0, 1.0, // Top left
    ]);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  //=========================================================
  // Frame - rendering
  //=========================================================

  drawFrame(frame) {
    this.updateFrameTexture(frame);
    this.updateShaderParams(frame);
    this.drawFrameVerticies(frame);
  }

  updateFrameTexture(frame) {
    const filter = this.smoothing ? this.gl.LINEAR : this.gl.NEAREST;
    const data = new Uint8Array(frame.data.buffer); // We have to pass byte array to WebGL
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, frame.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, frame.width, frame.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
  }

  updateShaderParams(frame) {
    this.gl.uniform1i(this.samplerUniform, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.verticies);
    this.gl.vertexAttribPointer(this.vertexPositionAttribute, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.coords);
    this.gl.vertexAttribPointer(this.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
  }

  drawFrameVerticies(frame) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, frame.verticies);
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
  }

  //=========================================================
  // Begin / End
  //=========================================================

  begin() {
    const {width, height} = this.gl.canvas;
    const screenWidth = width / this.scale;
    const screenHeight = height / this.scale;
    this.gl.viewport(0, 0, width, height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.uniform2f(this.screenSizeUniform, screenWidth, screenHeight);
  }

  end() {
    this.gl.flush();
  }

  //=========================================================
  // Parameters
  //=========================================================

  initParams() {
    this.scale = 1;
    this.smoothing = false;
  }

  setScale(scale) {
    this.scale = scale;
  }

  setSmoothing(smoothing) {
    this.smoothing = smoothing;
  }

}
