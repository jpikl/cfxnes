# Audio API

**Note: This documentation is for the upcoming version 0.5.0**

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| audioEnabled | `boolean` | `true` | Enables audio output. |
| audioVolume | `number`&nbsp;or&nbsp;`object` | `0.5` (master volume), `1.0` (channel volume) | Master volume or detailed volume configuration. Volume is a value between `0` and `1`. |

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

Enables/disables audio output.

- **enabled**: `boolean` - `true` to enable audio output; `false` to disable 

#### .isAudioEnabled()

Returns whether audio output is currently enabled.

- **returns**: `boolean` - `true` if audio output is enabled; `false` otherwise

#### .setAudioVolume([channel,] volume)

Sets volume of the specified channel.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel; omit to set the master volume
- **volume**: `number` - the volume 

#### .getAudioVolume([channel])

Returns current volume of the specified channel.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel; omit to get the master volume
- **returns**: `number` - the volume 

## Enumerations

#### AudioChannel

- `'pulse1'` - Pulse channel #1
- `'pulse2'` - Pulse channel #2
- `'triangle'` - Triangle channel
- `'noise'` - Noise channel
- `'dmc'` - DMC channel
- `'master'` - *Special value used to address the master volume*.