import {log, roundUpToPow2} from '../../../../core/src/common';
import {BLACK_COLOR} from '../../../../core/src/video';
import {LINEAR} from '../filters';

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

  constructor(canvas) {
    this.initContext(canvas);
    this.initShaders();
    this.initParams();
  }

  initContext(canvas) {
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
    const {gl} = this;
    const program = this.compileAndLinkShaders();
    this.screenSizeUniform = gl.getUniformLocation(program, 'uScreenSize');
    this.samplerUniform = gl.getUniformLocation(program, 'uSampler');
    this.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
    this.textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.textureCoordAttribute);
    gl.useProgram(program);
  }

  compileAndLinkShaders() {
    const {gl} = this;
    const program = gl.createProgram();
    gl.attachShader(program, this.compileShadder(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
    gl.attachShader(program, this.compileShadder(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Shader linking error');
    }
    return program;
  }

  compileShadder(type, source) {
    const {gl} = this;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  //=========================================================
  // Frame - creation
  //=========================================================

  createFrame(x, y, width, height) {
    width = roundUpToPow2(width);
    height = roundUpToPow2(height);
    const {gl} = this;
    const data = this.createFrameData(width, height);
    const verticies = this.createFrameVerticies(x, y, width, height);
    const coords = this.createFrameCoords();
    const texture = gl.createTexture();
    return {width, height, data, verticies, coords, texture};
  }

  createFrameData(width, height) {
    return new Uint32Array(width * height).fill(BLACK_COLOR);
  }

  createFrameVerticies(x, y, width, height) {
    const {gl} = this;
    const data = new Float32Array([
      x, y,                  // Bottom left
      x + width, y,          // Bottom right
      x + width, y + height, // Top right
      x, y + height,         // Top left
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  createFrameCoords() {
    const {gl} = this;
    const data = new Float32Array([
      0.0, 0.0, // Bottom left
      1.0, 0.0, // Bottom right
      1.0, 1.0, // Top right
      0.0, 1.0, // Top left
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
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
    const {gl} = this;
    const filter = this.filter === LINEAR ? gl.LINEAR : gl.NEAREST;
    const data = new Uint8Array(frame.data.buffer); // We have to pass byte array to WebGL
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frame.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frame.width, frame.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  updateShaderParams(frame) {
    const {gl} = this;
    gl.uniform1i(this.samplerUniform, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.verticies);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.coords);
    gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  }

  drawFrameVerticies(frame) {
    const {gl} = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.verticies);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  //=========================================================
  // Begin / End
  //=========================================================

  begin() {
    const {gl} = this;
    const {width, height} = gl.canvas;
    const screenWidth = width / this.scale;
    const screenHeight = height / this.scale;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.screenSizeUniform, screenWidth, screenHeight);
  }

  end() {
    this.gl.flush();
  }

  //=========================================================
  // Parameters
  //=========================================================

  initParams() {
    this.scale = 1;
    this.filter = false;
  }

  setScale(scale) {
    this.scale = scale;
  }

  setFilter(filter) {
    this.filter = filter;
  }

}
