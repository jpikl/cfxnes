# System API

**Note: This documentation is for the upcoming version 0.5.0**

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Default | Description |
|------|------|----------|-------------|
| speed | `number` | `1.0` | Emulation speed multiplier. It must be larger than `0`. |
| region | [`Region`](#user-content-region) | `'auto'` | Emulated region of NES. |

*Example:*

``` javascript
new CFxNES({
  speed: 1.0,
  region: 'auto',
});
```


## Methods

#### .start()

Starts the emulator. In case there is no ROM image loaded, the emulator will display white noise as its video output.

#### .stop()

Stops the emulator.

#### .step()

Forces the emulator to render one frame. Useful when you need to just refresh video output without starting the emulator.

#### .isRunning()

Returns whether the emulator is running.

- **returns**: `boolean` - `true` if emulator is running; `false` otherwise

#### .hardReset()

Does hard reset. Equivalent of pressing the *power* button of the original NES.

#### .softReset()

Does soft reset. Equivalent of pressing the *reset* button of the original NES.

#### .getSpeed()

Returns the current emulation speed multiplier.

- **returns**: `number` - the speed multiplier

#### .setSpeed(speed)

Sets the emulation speed multiplier.

- **speed**: `number` - the speed multiplier

#### .getRegion()

Returns the current emulated region of NES.

- **returns**: [`Region`](#user-content-region) - the region

#### .setRegion(region)

Sets the emulated region of NES.

- **region**: [`Region`](#user-content-region) - the region

#### .getFPS()

Returns number of frames per second of the running emulator.

- **returns**: `number` - the number of FPS

## Enumerations

#### Region

- `'auto'` - Automatic region detection based on header data of loaded ROM image.
- `'ntsc'` - NTSC region. Emulation will run at 60 FPS.
- `'pal'` - PAL region. Emulation will run at 50 FPS.
