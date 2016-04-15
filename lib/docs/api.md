# CFxNES API

**Note: This documentation is for the upcoming version 0.5.0**

- [Initialization](#user-content-initialization)
- [Options and Methods](#user-content-options-and-methods)
- [External dependencies](#user-content-external-dependencies)
- [Static properties](#user-content-static-properties)
- [Static methods](#user-content-static-methods)
- [Enumerations](#user-content-enumerations)

## Initialization

#### new CFxNES([options])

Creates instance of the emulator. 

- **options**: `object` - [configuration options](#user-content-options-and-methods) and [external dependencies](#user-content-external-dependencies).

*Example*:

``` javascript
var cfxnes = new CFxNES({
    // Configuration options
    videoOutput: document.getElementById('canvas'),
    audioVolume: 0.75,
    // External dependencies (obtained through global variable, CommonJS, AMD, etc.)
    jszip: JSZip
});
```

## Options and Methods

For better orientation, the documentation was split into multiple documents.

- [System API](system-api.md)
- [Data API](data-api.md)
- [Video API](video-api.md)
- [Audio API](audio-api.md)
- [Input API](input-api.md)

## External dependencies

The following are **optional dependencies** which are not part of the CFxNES library and must be provided manually during initialization.

| Name | Description | Impact |
|------|-------------|--------|
| sha1 | Any SHA-1 implementation `ArrayBuffer ⇒ string` ([js-sha1](https://github.com/emn178/js-sha1) is recommended). | Internally used to differentiate between ROM images. Emulator will be able to persist game saves. |
| screenfull | [screenfull.js](https://github.com/sindresorhus/screenfull.js/) (v3.0.0 or compatible). | Emulator will support full screen mode. |
| jszip | [JSZip](https://github.com/Stuk/jszip) (v2.6.0 or compatible). | Emulator will be able to load zipped ROM images. |

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
