
# Data API

**Note: This documentation is for the upcoming version 0.5.0**

- [ROM images](#user-content-rom-images)
- [Non-Volatile RAM](#user-content-non-volatile-ram)
- [Configuration](#user-content-configuration)

## ROM Images

CFxNES is currently able to load *iNES* and *NES 2.0* ROM images. 

You can also provide ZIP archive as an input. In that case the first file with `.nes` extension in that archive will be loaded. This feature requires an [external dependency](api.md#user-content-external-dependencies)

*Example:*

``` javascript
cfxnes.loadROM('roms/game.nes') // Load ROM image from relative URL
    .then(() => cfxnes.start()) // Start the emulator
    .catch(error => /* Handle error */)
```

#### .loadROM(source)

Loads ROM image from the specified source. If the emulator is already running, the ROM image will be immediately executed.

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

Non-volatile RAM (NVRAM) is a memory that is usually battery-backed and serves as a place for game saves. NVRAM is only used by some games (e.g., The Legend of Zelda or Final Fantasy).

Use [getNVRAM](#user-content-get-nvram), [setNVRAM](#user-content-set-nvram) for direct NVRAM manipulation. 

Use [loadNVRAM](#user-content-load-nvram), [saveNVRAM](#user-content-save-nvram) for persisting NVRAM in IndexedDB. NVRAMs of various games are differentiated using SHA-1 checksums of their ROM images. To be able to compute SHA-1, an [external dependency](api.md#user-content-external-dependencies) is required.

*Example:*
``` javascript
cfxnes.saveNVRAM() // Persist game saves of the currently running game
    .then(() => cfxnes.loadROM(arrayBuffer)) // Load a different game
    .then(() => cfxnes.loadNVRAM()) // Restore its game saves 
```

#### .getNVRAM()

Returns NVRAM data of the currently running game.

- **returns**: `Uint8Array` | `null` - NVRAM data or `null` when NVRAM is not available

#### .setNVRAM(data)

Sets NVRAM data of the currently running game. The behavior of this method is undefined if NVRAM is unavailable or has different size then the provided data.

- **data**: Uint8Array - NVRAM data

#### .loadNVRAM()

Loads NVRAM of the currently running game from IndexedDB.

- **returns**: `Promise` - promise resolved when data are loaded

#### .saveNVRAM()

Stores NVRAM of the currently running game into IndexedDB.

- **returns**: `Promise` - promise resolved when data are stored

#### .deleteNVRAMs()

Deletes all NVRAMs stored in IndexedDB.

- **returns**: `Promise` - promise resolved when all data are deleted

## Configuration

See documentation of all available [configuration options](api.md#user-content-options-and-methods).

*Example:*
``` javascript
cfxnes.setOptions({audioVolume: 0.75, videoScale: 2});
// Has the same effect as
cfxnes.setAudioVolume(0.75);
cfxnes.setVideoScale(2);
```

#### .getOptions()

Returns all configuration options and their values.

- **returns**: `object` - configuration options

#### .setOptions(options)

Sets values of the specified configuration options.

- **options**: `object` - configuration options

#### .resetOptions()

Resets all configuration options to their default value.

#### .loadOptions()

Loads configuration options from Local Storage.

#### .saveOptions()

Stores all configuration options to Local Storage.

#### .deleteOptions()

Removes all configuration options from Local Storage.
