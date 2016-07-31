# Video API

**Note: This documentation is for the upcoming version 0.5.0**

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| videoOutput | `HTMLCanvasElement` | `undefined` | Canvas element used for rendering. This option is not persisted when calling [`saveOptions()`](data-api.md#user-content-saveoptions). |
| videoRenderer | [`VideoRenderer`](#user-content-videorenderer) | `'webgl'` | Rendering back-end. |
| videoPalette | [`VideoPalette`](#user-content-videopalette) | `'fceux'` | Palette used for generating RGB color values. |
| videoScale | `number` | `1.0` | Canvas resolution multiplier. Value must be larger than `0`. Non-integer value might cause visual artifacts due to upscaling. The base resolution is 256x240. |
| videoSmooting | `boolean` | `false` | Enables smoothing effect for upscaled canvas resolution. |
| videoDebug | `boolean` | `false` | Enables additional video output (content of pattern tables and background/sprite palettes) to be displayed on canvas. This will also double width of the canvas. |
| fullscreenType | [`FullscreenType`](#user-content-fullscreentype) | `'maximized'` | Type of full screen mode. |

*Example:*

``` javascript
new CFxNES({
  videoOutput: document.getElementById('canvas-id'),
  videoRenderer: 'webgl',
  videoPalette: 'fceux',
  videoScale: 1.0,
  videoSmooting: false,
  videoDebug: false,
  fullscreenType: 'maximized'
});
```


## Methods

#### .setVideoOutput(canvas)

Sets the `canvas` element used for rendering.

- **canvas**: `HTMLCanvasElement` - the canvas element

#### .getVideoOutput()

Returns the `canvas` element currently used for rendering.

- **returns**: `HTMLCanvasElement` - the canvas element

#### .setVideoRenderer(renderer)

Sets the rendering back-end. The `'canvas'` renderer is used as fallback in case of unsupported renderer.
**It is not possible to change renderer for a canvas once it's context was initialized.**

- **renderer**: [`VideoRenderer`](#user-content-videorenderer) - the renderer

#### .getVideoRenderer()

Returns the currently used rendering back-end.

- **returns**: [`VideoRenderer`](#user-content-videorenderer) - the renderer

#### .isVideoRendererSupported(renderer)

Returns whether a renderer is supported. The method will always return `true` for the `'canvas'` renderer.

- **returns**: `boolean` - `true` if the specified render is supported; `false` otherwise

#### .setVideoScale(scale)

Sets the canvas resolution multiplier.

- **scale**: `number` - the resolution multiplier

#### .getVideoScale()

Returns the current canvas resolution multiplier.

- **returns**: `number` - the resolution multiplier

#### .getMaxVideoScale()

Returns the largest possible value of the `videoScale` option that does not cause canvas to overgrow screen resolution.

- **returns**: `number` - the resolution multiplier

#### .setVideoSmoothing(smoothing)

Enables/disables smoothing effect for upscaled canvas.

- **smoothing**: `boolean` - `true` to enable smoothing; `false` to disable

#### .isVideoSmoothing()

Returns whether smoothing effect is currently enabled.

- **returns**: `boolean` - `true` if smoothing is enabled; `false` otherwise

#### .setVideoDebug(debug)

Enables/disables additional debug output to be displayed on canvas.

- **debug**: `boolean` - `true` to enable debug output; `false` to disable

#### .isVideoDebug()

Returns whether debug output is currently enabled.

- **returns**: `boolean` - `true` if debug output is enabled; `false` otherwise

#### .enterFullscreen()

Switches to full screen mode. It's recommended to wrap `canvas` element in extra `div` to make full screen working properly.

- **returns**: `Promise` - promise resolved when full screen is entered

#### .exitFullscreen()

Exits full screen mode.

- **returns**: `Promise` - promise resolved when full screen is exited

#### .setFullscreenType(type)

Sets the type of full screen mode.

- **type**: [`FullscreenType`](#user-content-fullscreentype) - the type of full screen mode

#### .getFullscreenType()

Returns the current type of full screen mode.

- **returns**: [`FullscreenType`](#user-content-fullscreentype) - the type of full screen mode

## Enumerations

#### VideoRenderer

- `'canvas'` - Rendering using the Canvas API. It is used as fallback when WebGL is not available.
- `'webgl'` - Rendering using WebGL. It reduces CPU usage and possible screen tearing artifacts. WebGL is typically faster than the `'canvas'` renderer, but this highly depends on browser, OS, graphic card driver, etc.

#### VideoPalette

See [FCEUX documentation](http://www.fceux.com/web/help/fceux.html?PaletteOptions.html) for description of each palette.

- `'asq-real-a'` - ASQ (reality A)
- `'asq-real-b'` - ASQ (reality B)
- `'bmf-fin-r2'` - BMF (final revision 2)
- `'bmf-fin-r3'` - BMF (final revision 3)
- `'fceu-13'` - FCEU .13
- `'fceu-15'` - FCEU .15
- `'fceux'` - FCEUX
- `'nestopia-rgb'` - Nestopia (RGB)
- `'nestopia-yuv'` - Nestopia (YUV)

#### FullscreenType

- `'maximized'` - Maximizes the output resolution while keeping its original aspect ratio.
- `'normalized'` - Same as the `'maximazed'` type, but the output resolution is integer multiple of the base resolution 256x240. This should reduce visual artifacts caused by resolution upscaling.
- `'stretched'` - Output is stretched to fill the whole screen (both horizontally and vertically). The original aspect ratio is not preserved.
