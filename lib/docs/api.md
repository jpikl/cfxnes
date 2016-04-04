# CFxNES API

- [Initialization](#user-content-initialization)
- [Options and Methods](#user-content-options-and-methods)
- [Static properties](#user-content-static-properties)
- [Static methods](#user-content-static-methods)
- [Enumerations](#user-content-enumerations)

## Initialization

#### new CFxNES([options])

Creates instance of the emulator.

- **options**: `object` - initial configuration. See description of emulator options in the [sections bellow](#user-content-options-and-methods).

*Example*:

```javascript
var cfxnes = new CFxNES({
    videoOuput: document.getElementById('canvas'),
    videoScale: 2,
    audioVolume: 0.75    
});
```

## Options and Methods

For better orientation, the documentation was split into separate pages:

- [General API](general-api.md)
- [Cartridge API](cartridge-api.md)
- [Video API](video-api.md)
- [Audio API](audio-api.md)
- [Input API](input-api.md)
- [Persistence API](persistence-api.md)

## Static properties

#### CFxNES.version

Version of the emulator.
- **type**: `string`

## Static methods

#### CFxNES.setLogLevel(level)

Sets global logging level for all emulator instances. The default value is `'warn'`.

- **level**: [`LogLevel`](#user-content-loglevel) - logging level

## Enumerations

#### LogLevel

- `'off'` - Logging is disabled.
- `'error'` - Log errors.
- `'warn'` - Log errors and warnings.
- `'info'` - Log errors, warnings and info messages.
- `'all'` - Alias for `'info'`.
