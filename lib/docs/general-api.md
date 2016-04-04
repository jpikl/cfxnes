# General API

- [Options](#user-content-options)
- [Methods](#user-content-methods)
- [Enumerations](#user-content-enumerations)

## Options

| Name | Type | Defaults | Description |
|------|------|----------|-------------|
| speed | `number` | `1.0` | Emulation speed multiplier. |
| region | [`Region`](#user-content-region) | `'auto'` | Emulated region of NES. |

## Methods

#### .setDefaults()

Sets the default emulator configuration. 

#### .start()

Starts emulator.

#### .stop()

Stops emulator.

#### .step()

Causes emulator to render one frame. Useful when you need to just refresh video output without starting the emulator.

#### .isRunning()

Checks whether emulator is running.

- **returns**: `boolean` - `true` if emulator is running; `false` otherwise

#### .hardReset()

Performs hard reset. Equivalent of pressing the *power* button of the original NES.

#### .softReset()

Performs soft reset. Equivalent of pressing the *reset* button of the original NES.

#### .getSpeed()

Returns the current emulation speed multiplier.

- **returns**: `number` - emulation speed

#### .setSpeed(speed)

Sets the emulation speed multiplier.

- **speed**: `number` - emulation speed

#### .getRegion()

Returns the current emulated region of NES.

- **returns**: [`Region`](#user-content-region) - region

#### .setRegion(region)

Sets the emulated region of NES.

- **region**: [`Region`](#user-content-region) - region

#### .getFPS()

Returns the number of frames per second of running emulator. Undefined behavior when the emulator is not running.

- **returns**: `number` - number of frames per second

## Enumerations

#### Region

- `'auto'` - Automatic region detection based on header data of ROM images.
- `'ntsc'` - NTSC region. Emulation will run at 60 FPS.
- `'pal'` - PAL region. Emulation will run at 50 FPS.
