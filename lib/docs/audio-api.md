# Audio API

**Note: This documentation is for the upcoming version 0.5.0**

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| audioEnabled | `boolean` | `true` | Enables audio. |
| audioVolume | `number`&nbsp;or&nbsp;`object` | `0.5` (see example bellow) | Audio volume or detailed volume configuration. Volume is a value between `0` and `1`. |

*Example:*

``` javascript
new CFxNES({
  audioEnabled: true,
  audioVolume: 0.5 // Master volume
});
```

*Example (detailed volume configuration):*

``` javascript
new CFxNES({
  audioVolume: {
    // Master volume (0.5 when omitted)
    master: 0.5,
    // Separate volume for each audio channel (1.0 when a channel is omitted)
    pulse1: 1.0, pulse2: 1.0,  triangle: 1.0, noise: 1.0, dmc: 1.0 
  },
});
```

## Methods

#### .isAudioSupported()

Returns whether audio playback is supported by the current browser.

- **returns**: `boolean` - `true` if audio is supported; `false` otherwise 

#### .setAudioEnabled(enabled)

Enables audio.

- **enabled**: `boolean` - `true` to enable audio; `false` to disable 

#### .isAudioEnabled()

Returns whether audio is enabled.

- **returns**: `boolean` - `true` if audio is enabled; `false` otherwise

#### .setAudioVolume([channel,] volume)

Sets volume of the specified channel. The `channel` argument can be omitted to set the master volume.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel
- **volume**: `number` - the volume 

#### .getAudioVolume([channel])

Returns current volume of the specified channel. The `channel` argument can be omitted to return the master volume.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel 
- **returns**: `number` - the volume 

## Enumerations

#### AudioChannel

- `'pulse1'` - Pulse channel #1
- `'pulse2'` - Pulse channel #2
- `'triangle'` - Triangle channel
- `'noise'` - Noise channel
- `'dmc'` - DMC channel
- `'master'` - *Special value used to set the master volume*.