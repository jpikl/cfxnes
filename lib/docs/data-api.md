
# Data API

- [ROM images](#user-content-rom-images)
- [Non-Volatile RAM](#user-content-non-volatile-ram)
- [Configuration](#user-content-configuration)

## ROM Images

CFxNES is currently able to load *iNES* and *NES 2.0* ROM images. 

You can also provide ZIP archive as an input. In that case the first file with `.nes` extension in that archive will be loaded. This feature requires an [external dependency](api.md#user-content-external-dependencies)

*Example:*

``` javascript
cfxnes.loadROM('roms/game.nes') // Load ROM image from relative URL
    .then(() => cfxnes.start()) // Start the emulator afterwards
    .catch(error => /* handle error */)
```

#### .loadROM(source)

Loads ROM image from the specified source. Emulator does not have to be stopped for an ROM image to be loaded.

- **source**: `string` | `File` | `ArrayBuffer` - source of a ROM image
- **returns**: `Promise` - promise resolved when the ROM image is loaded

| Source type   | Meaning |
|---------------|---------|
| `string`      | URL of the ROM image. |
| `File`        | File containing ROM image. |
| `ArrayBuffer` | Buffer containing ROM image. |
| `Uint8Array`  | Buffer containing ROM image. |

#### .unloadROM()

Unloads the current ROM image.

## Non-volatile RAM

Non-volatile RAM (NVRAM) is a part of memory that is usually battery-backed and serves as a place for game saves. Its length and origin (PRG/CHR) varies between games (most of then does not even have NVRAM).

Use [getNVRAM](#user-content-get-nvram), [setNVRAM](#user-content-set-nvram) for direct NVRAM manipulation. 

Use [loadNVRAM](#user-content-load-nvram), [saveNVRAM](#user-content-save-nvram) for persisting NVRAM inside IndexedDB. NVRAMs of various games are differentiated using SHA-1 checksums of their ROM images. To be able to compute SHA-1, an [external dependency](api.md#user-content-external-dependencies) is required.

*Example:*
``` javascript
cfxnes.saveNVRAM() // Persist game saves of the currently running game
    .then(() => cfxnes.loadROM(arrayBuffer)) // Load a different game
    .then(() => cfxnes.loadNVRAM()) // Restore its game saves 
```

#### .getNVRAM()

Returns NVRAM of the currently running game.

- **returns**: `Uint8Array` | `null` - data or `null` when NVRAM is not available

#### .setNVRAM(data)

Sets NVRAM of the currently running game. The behavior of this method is undefined if NVRAM unavailable or has different size then the provided data.

- **data**: Uint8Array - data

#### .loadNVRAM()

Loads NVRAM of the currently running game from IndexedDB.

- **returns**: `Promise` - promise resolved when data are loaded

#### .saveNVRAM()

Stores NVRAM of the currently running game into IndexedDB.

- **returns**: `Promise` - promise resolved when data are stored

## Configuration

Emulator configuration has a form of key-value pairs. See [their documentation](api.md#user-content-options-and-methods).

*Example:*
``` javascript
cfxnes.setConfig({audioVolume: 0.75, videoScale: 2});
// Has the same effect as
cfxnes.setAudioVolume(0.75);
cfxnes.setVideoScale(2);
```

#### .getConfig()

Returns emulator configuration.

- **returns**: `object` - the configuration

#### .setConfig([config])

Sets emulator configuration. Calling the method without parameter will set default configuration.

- **config**: `object` - the configuration

#### .loadConfig()

Loads emulator configuration from Local Storage.

#### .saveConfig()

Stores emulator configuration into Local Storage.
