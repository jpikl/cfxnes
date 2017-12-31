import {log, BLACK_COLOR} from '../../../../core';
import {NEAREST, LINEAR} from '../filters';

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
// Shader initialization
//=========================================================

function compileAndLinkShaders(gl) {
  const program = gl.createProgram();

  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Shader linking error');
  }

  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}

//=========================================================
// Context
//=========================================================

function getContext(canvas) {
  const options = {
    alpha: false,
    depth: false,
    antialias: false,
  };

  for (const name of ['webgl', 'experimental-webgl']) {
    log.info(`Getting ${name} canvas context`);
    const context = canvas.getContext(name, options);
    if (context) {
      return context;
    }
  }

  throw new Error('Unable to get webgl or experimental-webgl canvas context');
}

//=========================================================
// WebGL renderer
//=========================================================

export default class WebGLRenderer {

  constructor(canvas) {
    const gl = getContext(canvas);
    const program = compileAndLinkShaders(gl);
    const screenSizeUniform = gl.getUniformLocation(program, 'uScreenSize');
    const samplerUniform = gl.getUniformLocation(program, 'uSampler');
    const vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
    const textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord');

    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.enableVertexAttribArray(textureCoordAttribute);
    gl.useProgram(program);

    this.gl = gl;
    this.scale = 1;
    this.filter = NEAREST;
    this.screenSizeUniform = screenSizeUniform;
    this.samplerUniform = samplerUniform;
    this.vertexPositionAttribute = vertexPositionAttribute;
    this.textureCoordAttribute = textureCoordAttribute;
  }

  //=========================================================
  // Frame creation
  //=========================================================

  createFrame(x, y, width, height) {
    width = roundUpToPow2(width);
    height = roundUpToPow2(height);

    const {gl} = this;
    const data = this.createFrameData(width, height);
    const vertices = this.createFrameVertices(x, y, width, height);
    const coords = this.createFrameCoords();
    const texture = gl.createTexture();

    return {width, height, data, vertices, coords, texture};
  }

  createFrameData(width, height) {
    return new Uint32Array(width * height).fill(BLACK_COLOR);
  }

  createFrameVertices(x, y, width, height) {
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
  // Frame rendering
  //=========================================================

  drawFrame(frame) {
    this.updateFrameTexture(frame);
    this.updateShaderParams(frame);
    this.drawFrameVertices(frame);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.vertices);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.coords);
    gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  }

  drawFrameVertices(frame) {
    const {gl} = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, frame.vertices);
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

  setScale(scale) {
    this.scale = scale;
  }

  setFilter(filter) {
    this.filter = filter;
  }

}

//=========================================================
// Utils
//=========================================================

function roundUpToPow2(number) {
  let result = 1;
  while (result < number) {
    result *= 2;
  }
  return result;
}
