# Audio API

**Note: This documentation is for the upcoming version 0.5.0**

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| audioEnabled | `boolean` | `true` | Enables audio. |
| audioVolume | `number` | `0.5` | Master volume. It must be between `0` and `1`. |
| audioChannels | `object` | `1.0` for each [`AudioChannel`](#user-content-audiochannel) | Volume of each channel (value between `0` and `1`). Channels can be omitted to keep their default volume. |

*Example:*

``` javascript
new CFxNES({
  audioEnabled: true,
  audioVolume: 0.5,
  audioChannels: {pulse1: 1.0, pulse2: 1.0, triangle: 1.0, noise: 1.0, dmc: 1.0}    
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

#### .setAudioVolume(volume)

Sets the master volume.

- **volume**: `number` - the volume

#### .getAudioVolume()

Returns the current master volume.

- **returns**: `number` - the volume

#### .setAudioChannelVolume(channel, volume)

Sets volume of the specified channel.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel 
- **volume**: `number` - the volume 

#### .getAudioChannelVolume(channel)

Returns current volume of the specified channel.

- **channel**: [`AudioChannel`](#user-content-audiochannel) - the channel 
- **returns**: `number` - the volume 

## Enumerations

#### AudioChannel

- `'pulse1'` - Pulse channel #1
- `'pulse2'` - Pulse channel #2
- `'triangle'` - Triangle channel
- `'noise'` - Noise channel
- `'dmc'` - DMC channel