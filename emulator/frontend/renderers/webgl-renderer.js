import { BLACK_COLOR }       from "../../core/utils/colors";
import { roundUpToPowerOf2 } from "../../core/utils/convert";
import { logger }            from "../../core/utils/logger";
import { fillArray }         from "../../core/utils/system";

//=========================================================
// Shaders
//=========================================================

const VERTEX_SHADER_SOURCE = `
    uniform   vec2 uScreenSize;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying   vec2 vTextureCoord;

    void main(void) {
        float x = aVertexPosition.x / (0.5 * uScreenSize.x) - 1.0; // [-1, 1] -> [0, width]
        float y = 1.0 - aVertexPosition.y / (0.5 * uScreenSize.y); // [-1, 1] -> [height, 0]
        gl_Position = vec4(x, y, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    uniform sampler2D uSampler;
    varying vec2      vTextureCoord;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`

//=========================================================
// Renderer using WebGL API
//=========================================================

export class WebGLRenderer {

    static ["isSupported"]() { // TODO use regular name when closure compiler properly supports static methods
        return window && window["WebGLRenderingContext"] != null;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.initWebGL();
        this.initParameters();
        this.initShaders();
    }

    initWebGL() {
        if (!WebGLRenderer["isSupported"]()) {
            throw new Error("WebGL is not supported");
        }
        for (var id of [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ]) {
            if (this.gl = this.getContext(id)) {
                break;
            }
        }
        if (!this.gl) {
            throw new Error("Unable to get WebGL context");
        }
    }

    getContext(id) {
        try {
            logger.info(`Trying to get WebGL context '${id}'`);
            return this.canvas.getContext(id);
        } catch (error) {
            logger.warn(`Error when getting WebGL context '${id}': ${error}`);
            return null;
        }
    }

    //=========================================================
    // Shaders
    //=========================================================

    initShaders() {
        var program = this.compileAndLinkShaders();
        this.screenSizeUniform = this.gl.getUniformLocation(program, "uScreenSize");
        this.samplerUniform = this.gl.getUniformLocation(program, "uSampler");
        this.vertexPositionAttribute = this.gl.getAttribLocation(program, "aVertexPosition");
        this.textureCoordAttribute = this.gl.getAttribLocation(program, "aTextureCoord");
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.gl.enableVertexAttribArray(this.textureCoordAttribute);
        this.gl.useProgram(program);
    }

    compileAndLinkShaders() {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, this.compileShadder(this.gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE));
        this.gl.attachShader(program, this.compileShadder(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE));
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error("Shader linking error");
        }
        return program;
    }

    compileShadder(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(`Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }

    //=========================================================
    // Frame - initialization
    //=========================================================

    createFrame(x, y, width, height) {
        width = roundUpToPowerOf2(width);
        height = roundUpToPowerOf2(height);
        var data = this.createFrameData(width, height);
        var verticies = this.createFrameVerticies(x, y, width, height)
        var coords = this.createFrameCoords();
        var texture = this.gl.createTexture();
        return { width, height, data, verticies, coords, texture };
    }

    createFrameData(width, height) {
        var buffer = new ArrayBuffer(width * height * 4);
        var data = new Uint32Array(buffer);
        fillArray(data, BLACK_COLOR);
        return data;
    }

    createFrameVerticies(x, y, width, height) {
        var verticiesData = new Float32Array([
            x,         y,          // Bottom left
            x + width, y,          // Bottom right
            x + width, y + height, // Top right
            x,         y + height  // Top left
        ]);
        var verticiesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticiesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticiesData, this.gl.STATIC_DRAW);
        return verticiesBuffer;
    }

    createFrameCoords() {
        var coordsData = new Float32Array([
            0.0, 0.0, // Bottom left
            1.0, 0.0, // Bottom right
            1.0, 1.0, // Top right
            0.0, 1.0  // Top left
        ]);
        var coordsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, coordsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coordsData, this.gl.STATIC_DRAW);
        return coordsBuffer;
    }

    //=========================================================
    // Frame - rendering
    //=========================================================

    drawFrame(frame) {
        this.updateFrameTexture(frame);
        this.updateShaderParameters(frame);
        this.drawFrameVerticies(frame);
    }

    updateFrameTexture(frame) {
        var filter = this.smoothing ? this.gl.LINEAR : this.gl.NEAREST;
        var data = new Uint8Array(frame.data.buffer); // We have to pass byte array to WebGL
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, frame.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, frame.width, frame.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    }

    updateShaderParameters(frame) {
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
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform2f(this.screenSizeUniform, this.canvas.width / this.scale, this.canvas.height / this.scale); // Unscaled size
    }

    end() {
        this.gl.flush();
    }

    //=========================================================
    // Parameters
    //=========================================================

    initParameters() {
        this.smoothing = false;
        this.scale = 1;
    }

    setScale(scale) {
        this.scale = scale;
    }

    setSmoothing(smoothing) {
        this.smoothing = smoothing;
    }

}
