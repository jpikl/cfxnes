
# Data API

**Note: This documentation is for the upcoming version 0.5.0**

- [ROM images](#user-content-rom-images)
- [Non-Volatile RAM](#user-content-non-volatile-ram)
- [Configuration](#user-content-configuration)

## ROM Images

CFxNES is able to load [iNES](http://wiki.nesdev.com/w/index.php/INES) and [NES 2.0](http://wiki.nesdev.com/w/index.php/NES_2.0) ROM images.

It is also possible to load ZIP archive containing ROM image. The first file with `.nes` extension found in ZIP archive will be always loaded. This feature requires an [external dependency](api.md#user-content-external-dependencies).

*Example:*

``` javascript
cfxnes.loadROM('roms/game.nes') // Load ROM image from relative URL
    .then(() => cfxnes.start()) // Start the emulator
    .catch(error => /* Handle error */)
```

#### .loadROM(source)

Loads ROM image from the specified source. If the emulator is already running, the ROM image will be immediately executed.

- **source**: `string` | `File` | `Array` | `ArrayBuffer` | `Uint8Array` - the source of a ROM image
- **returns**: `Promise` - promise resolved when the ROM image is loaded

| Source type   | Meaning |
|---------------|---------|
| `string`      | URL of a ROM image. |
| `Blob`        | Blob containing ROM image. |
| `Array`, `ArrayBuffer`, `Uint8Array` | Buffer containing ROM image. |

#### .unloadROM()

Unloads the current ROM image.

#### .isROMLoaded()

Returns whether a ROM image is currently loaded.

**returns**: `boolean` - `true` if a ROM image is loaded; `false` otherwise

## Non-volatile RAM

Non-volatile RAM (NVRAM) is a memory that is usually battery-backed and serves as a place for game saves. NVRAM is only used by some games (e.g., The Legend of Zelda or Final Fantasy).

Use [getNVRAM](#user-content-getnvram), [setNVRAM](#user-content-setnvram) for direct NVRAM manipulation.

Use [loadNVRAM](#user-content-loadnvram), [saveNVRAM](#user-content-savenvram) to persist NVRAM in IndexedDB. NVRAMs of various games are differentiated using SHA-1 checksums of their ROM images.

*Example:*
``` javascript
cfxnes.saveNVRAM() // Persist game saves of the currently running game
    .then(() => cfxnes.loadROM(arrayBuffer)) // Load a different game
    .then(() => cfxnes.loadNVRAM()) // Restore its game saves
```

#### .getNVRAMSize()

Returns NVRAM size of the currently running game.

- **returns**: `number` - the size or `0` when NVRAM is unavailable

#### .getNVRAM()

Returns NVRAM data of the currently running game.

- **returns**: `Uint8Array` - the data or `null` when NVRAM is unavailable

#### .setNVRAM(data)

Sets NVRAM data for the currently running game. The provided data must have the same size as the NVRAM.

- **data**: `Uint8Array` - the data

#### .loadNVRAM()

Loads NVRAM of the currently running game from IndexedDB. The method does nothing if there are no data to load or NVRAM is unavailable.

- **returns**: `Promise` - promise resolved when data are loaded

#### .saveNVRAM()

Stores NVRAM of the currently running game into IndexedDB. The method does nothing if NVRAM is not available.

- **returns**: `Promise` - promise resolved when data are stored

#### .deleteNVRAMs()

Deletes all NVRAMs stored in IndexedDB.

- **returns**: `Promise` - promise resolved when data are deleted

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

- **returns**: `object` - the configuration options

#### .setOptions(options)

Sets values of the specified configuration options.

- **options**: `object` - the configuration options

#### .resetOptions(...names)

Resets the specified configuration options to their default value.

- **names**: `...string`  - one or more names of options to reset; omit to reset all options

#### .loadOptions()

Loads configuration options from Local Storage. The method does nothing if there are no options to load.

#### .saveOptions()

Stores all configuration options to Local Storage.

#### .deleteOptions()

Deletes all configuration options from Local Storage.
