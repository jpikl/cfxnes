###########################################################
# Shaders
###########################################################

VERTEX_SHADER_SOURCE = """
    uniform   vec2 uScreenSize;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying   vec2 vTextureCoord;

    void main(void) {
        float x = aVertexPosition.x / (0.5 * uScreenSize.x) - 1.0; // From left to right
        float y = 1.0 - aVertexPosition.y / (0.5 * uScreenSize.y); // From top to bottom
        gl_Position = vec4(x, y, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
"""

FRAGMENT_SHADER_SOURCE = """
    precision mediump float;

    uniform sampler2D uSampler;
    varying vec2      vTextureCoord;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
"""

###########################################################
# Renderer using WebGL API
###########################################################

class WebGLRenderer

    constructor: (@canvas) ->
        @initContext()
        @initParameters()
        @initShaders()

    initContext: ->
        unless window.WebGLRenderingContext
            throw new Error "WebGL is not supported"
        @gl = @canvas.getContext "webgl"
        unless @gl
            throw new Error "Unable to create WebGL context"

    ###########################################################
    # Shaders
    ###########################################################

    initShaders: ->
        program = @compileAndLinkShaders()
        @screenSizeUniform = @gl.getUniformLocation program, "uScreenSize"
        @samplerUniform = @gl.getUniformLocation program, "uSampler"
        @vertexPositionAttribute = @gl.getAttribLocation program, "aVertexPosition"
        @textureCoordAttribute = @gl.getAttribLocation program, "aTextureCoord"
        @gl.enableVertexAttribArray @vertexPositionAttribute
        @gl.enableVertexAttribArray @textureCoordAttribute
        @gl.useProgram program

    compileAndLinkShaders: ->
        program = @gl.createProgram()
        @gl.attachShader program, @compileShadder(@gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
        @gl.attachShader program, @compileShadder(@gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
        @gl.linkProgram program
        unless @gl.getProgramParameter program, @gl.LINK_STATUS
            throw new Error "Shader linking error"
        program

    compileShadder: (type, source) ->
        shader = @gl.createShader type
        @gl.shaderSource shader, source
        @gl.compileShader shader
        unless @gl.getShaderParameter shader, @gl.COMPILE_STATUS
            throw new Error "Shader compilation error: #{@gl.getShaderInfoLog shader}"
        shader

    ###########################################################
    # Frames - initialization
    ###########################################################

    createFrame: (x, y, width, height) ->
        width  = @roundUpToPowerOf2 width
        height = @roundUpToPowerOf2 height
        width:     width
        height:    height
        data:      @createFrameData width, height
        verticies: @createFrameVerticies x, y, width, height
        coords:    @createFrameCoords()
        texture:   @gl.createTexture()

    roundUpToPowerOf2: (number) ->
        result = 1
        result *= 2 while result < number
        result

    createFrameData: (width, height) ->
        data = new Uint8Array width * height * 4
        for i in [0...data.length]
            data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        data

    createFrameVerticies: (x, y, width, height) ->
        verticiesData = new Float32Array [
            x,         y,          # Bottom left
            x + width, y,          # Bottom right
            x + width, y + height, # Top right
            x,         y + height  # Top left
        ]
        verticiesBuffer = @gl.createBuffer()
        @gl.bindBuffer @gl.ARRAY_BUFFER, verticiesBuffer
        @gl.bufferData @gl.ARRAY_BUFFER, verticiesData, @gl.STATIC_DRAW
        verticiesBuffer

    createFrameCoords: ->
        coordsData = new Float32Array [
            0.0, 0.0, # Bottom left
            1.0, 0.0, # Bottom right
            1.0, 1.0, # Top right
            0.0, 1.0  # Top left
        ]
        coordsBuffer = @gl.createBuffer()
        @gl.bindBuffer @gl.ARRAY_BUFFER, coordsBuffer
        @gl.bufferData @gl.ARRAY_BUFFER, coordsData, @gl.STATIC_DRAW
        coordsBuffer

    ###########################################################
    # Frames - rendering
    ###########################################################

    drawFrame: (frame) ->
        @updateFrameTexture frame
        @updateShaderParameters frame
        @drawFrameVerticies frame

    updateFrameTexture: (frame) ->
        filter = if @smoothing then @gl.LINEAR else @gl.NEAREST
        @gl.activeTexture @gl.TEXTURE0
        @gl.bindTexture @gl.TEXTURE_2D, frame.texture
        @gl.texParameteri @gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, filter
        @gl.texParameteri @gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, filter
        @gl.texImage2D @gl.TEXTURE_2D, 0, @gl.RGBA, frame.width, frame.height, 0, @gl.RGBA, @gl.UNSIGNED_BYTE, frame.data

    updateShaderParameters: (frame) ->
        @gl.uniform1i @samplerUniform, 0
        @gl.bindBuffer @gl.ARRAY_BUFFER, frame.verticies
        @gl.vertexAttribPointer @vertexPositionAttribute, 2, @gl.FLOAT, false, 0, 0
        @gl.bindBuffer @gl.ARRAY_BUFFER, frame.coords
        @gl.vertexAttribPointer @textureCoordAttribute, 2, @gl.FLOAT, false, 0, 0

    drawFrameVerticies: (frame) ->
        @gl.bindBuffer @gl.ARRAY_BUFFER, frame.verticies
        @gl.drawArrays @gl.TRIANGLE_FAN, 0, 4

    ###########################################################
    # Begin / End
    ###########################################################

    begin: ->
        @gl.viewport 0, 0, @canvas.width, @canvas.height
        @gl.clearColor 0.0, 0.0, 0.0, 1.0
        @gl.clear @gl.COLOR_BUFFER_BIT
        @gl.uniform2f @screenSizeUniform, @canvas.width / @scale, @canvas.height / @scale # Unscaled size

    end: ->
        @gl.flush()

    ###########################################################
    # Parameters
    ###########################################################

    initParameters: ->
        @smoothing = false
        @scale = 1

    setScale: (scale) ->
        @scale = scale

    setSmoothing: (smoothing) ->
        @smoothing = smoothing

module.exports = WebGLRenderer
