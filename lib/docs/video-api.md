# Video API

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Defaults | Description |
|------|------|----------|-------------|
| videoOutput | `DOM element` | | Canvas element used for rendering. |
| videoScale | `number` | `1` | Resolution multiplier. Integer between `1` and [`.getMaxVideoScale()`](#getmaxvideoscale) |
| videoRenderer | [`VideoRenderer`](#videorenderer) | `'webgl'` | Render backend. |

## Methods

#### .setVideoOutput(canvas)

Sets canvas element used for rendering.

- **canvas**: `DOM element` - canvas element

#### .getMaxVideoScale()

Returns the maximal value that will be accepted as `videoScale` option.

- **returns**: `integer` the maximal allowed value of the `videoScale` option

## Enumerations

#### VideoRenderer

- `'webgl'` - renderer using WebGL
- `'canvas'` - renderer using Canvas API
