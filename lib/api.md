# cfxnes API

Note: This documentation is for the upcoming version 0.5.0

- [cfxnes](#user-content-cfxnesoptions)
- [nes](#user-content-nes)
- [nes.rom](#user-content-nesrom)
- [nes.nvram](#user-content-nesnvram)
- [nes.video](#user-content-nesvideo)
- [nes.fullscreen](#user-content-nesfullscreen)
- [nes.audio](#user-content-nesaudio)
- [nes.devices](#user-content-nesdevices)
- [nes.inputs](#user-content-nesinputs)
- [nes.options](#user-content-nesoptions)

## cfxnes([options])

Function that returns new emulator instance.

**options** - Initialization options. See the following documentation sections for their description.

``` javascript
let nes;

// No options specified.
nes = cfxnes();

// All options and their default values.
nes = cfxnes({
  region: 'auto',
  speed: 1,
  rom: undefined,
  JSZip: undefined,
  video: {
    output: null,
    renderer: 'webgl',
    scale: 1,
    palette: 'fceux',
    smoothing: false,
    debug: false,
  },
  fullscreen: {
    type: 'maximized',
  }
  audio: {
    enabled: true,
    volume: {
      master: 0.5,
      pulse1: 1,
      pulse2: 1,
      triangle: 1,
      noise: 1,
      dmc: 1,
    },
  },
  devices: {
    1: 'joypad',
    2: 'zapper',
  },
  inputs: {
    '1.joypad.a': 'keyboard.x',
    '1.joypad.b': ['keyboard.y', 'keyboard.z'],
    '1.joypad.start': 'keyboard.enter',
    '1.joypad.select': 'keyboard.shift',
    '1.joypad.up': 'keyboard.up',
    '1.joypad.down': 'keyboard.down',
    '1.joypad.left': 'keyboard.left',
    '1.joypad.right': 'keyboard.right',
    '2.zapper.trigger': 'mouse.left',
  },
});

```

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| version | `string` | no |  | cfxnes version. |
| logLevel | `string` | yes | `'warn'` | Verbosity of logging for all emulator instances.<br>`'off'` - Logging is disabled.<br>`'error'` - Log errors.<br>`'warn'` - Log errors and warnings.<br>`'info'` - Log errors, warnings and info messages. |

#### Methods

| Signature | Returns | Description |
|-----------|---------|-------------|
| close() |`Promise` | Releases resources allocated by all emulator instances. |

``` javascript
cfxnes.version; // '0.4.0', '1.0.0', '1.2.1', etc.

cfxnes.logLevel = 'off'; // Disable logging
cfxnes.logLevel = 'info'; // Log everything

// Release resources
cfxnes.close().then(() => {
    console.log('done');
})

```

## nes

Emulator instance returned by the `cfxnes` function.

It defines basic (execution-related) properties/methods and aggregates various submodules (`rom`, `nvram`, `video`, `fullscreen`, `audio`, `devices`, `inputs`).

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| running | `number` | no | `false` | `true` when emulator is running, `false` otherwise. |
| fps  | `number` | no || Number of frames per second of running emulator. |
| region | `string` | yes | `'auto'` | Emulated NES region.<br>`'auto'` - Automatic region detection (not very reliable).<br>`'ntsc'` - NTSC region (60 FPS).<br>`'pal' - `PAL region (50 FPS). |
| speed | `number` | yes | `1` | Emulation speed multiplier. It must be larget than 0. |

#### Methods

| Signature | Returns | Description |
|-----------|---------|-------------|
| start() | void | Starts emulator. In case there is no ROM image loaded, emulator will display white noise as its video output. |
| stop() | void | Stops emulator. |
| step() | void | Forces emulator to render one frame. |
| power() | void | HW reset (NES power button). |
| reset() | void | SW reset (NES reset button). |

``` javascript
const nes = cfxnes();

nes.region = 'pal'; // Set PAL region
nes.speed = 1.5; // Set 1.5x emulation speed

nes.running; // false
nes.start(); // Start emulator
nes.running; // true
nes.stop(); // Stop emulator
nes.running; // false

nes.step() // Render one frame

nes.power(); // HW reset
nes.reset(); // SW reset
```

## nes.rom

Module that can load ROM images into emulator.

Supported ROM image formats are [iNES](http://wiki.nesdev.com/w/index.php/INES) and [NES 2.0](http://wiki.nesdev.com/w/index.php/NES_2.0). cfxnes can also load zipped ROM image when [JSZip library](https://github.com/Stuk/jszip) (2.6.0 or compatible) is present. JSZip can be provided either through global variable `window.JSZip` or using `JSZip` initialization option.

``` javascript
cfxnes({JSZip});
```

A ROM image can be loaded in two ways:

1. Using `rom` initialization option. This will load ROM image from the specified source and then automatically starts execution. All loading errors will be logged using `console.error`.
2. Calling `nes.rom.load()` method. This allows more precise control over the loading process.

``` javascript
// 1. Using rom initialization option
cfxnes({rom: source});

// 2. Calling nes.rom.load() method
const nes = cfxnes();
nes.rom.load(source)
  .then(() => {/* handle success */})
  .catch(error => {/* handle error */})
```

The source can be `Uint8Array`, `ArrayBuffer`, `Array`, `Blob` or `string`. String value is interpreted as URL of a ROM image.

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| loaded | `boolean` | no | `false` | `true` when a ROM image is loaded, `false` otherwise.  |
| sha1  | `string` | no | `null` | SHA-1 of the loaded ROM image, `null` otherwise. |

#### Methods

| Signature | Returns | Description |
|-----------|---------|-------------|
| load(source) | `Promise` | Loads ROM image from the specified source. The returned Promise is resolved when the loading is done.  |
| unload() || Unloads the current ROM image. |


``` javascript
const nes = cfxnes();
const {rom} = nes;

rom.loaded; // false
rom.sha1; // null

// Load ROM image from relative URL
rom.load('roms/game.nes').then(() => {
  rom.loaded; // true
  rom.sha1; // SHA-1 of the loaded ROM
  rom.unload(); // Unload the ROM
  rom.loaded; // false;
}).catch(error => {
  console.error('Oops!', error);
})

// Load ROM image from memory or blob
var data = receiveData(); // Uint8Array, ArrayBuffer, Array, Blob
rom.load(data).then(/* ... */);
```

## nes.nvram

## nes.video

## nes.fullscreen

## nes.audio

## nes.devices

## nes.inputs

## nes.options

