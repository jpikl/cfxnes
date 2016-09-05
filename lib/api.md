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

**options** - initialization options. See the following documentation sections for their description.

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
| region | `string` | yes | `'auto'` | Emulated NES region.<br>`'auto'` - Automatic region detection (not very reliable).<br>`'ntsc'` - NTSC region (60 FPS).<br>`'pal'` - PAL region (50 FPS). |
| speed | `number` | yes | `1` | Emulation speed multiplier. It must be larger than 0. |

#### Methods

| Signature | Description |
|-----------|-------------|
| start() | Starts emulator. |
| stop() | Stops emulator. |
| step() | Forces emulator to render one frame. |
| power() | HW reset (NES power button). |
| reset() | SW reset (NES reset button). |

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

1. Use `rom` initialization option. This will load ROM image from the specified source and then automatically starts execution. All loading errors will be logged using `console.error`.
2. Call `nes.rom.load()` method. This allows more precise control over the loading process.

``` javascript
// 1. Use 'rom' initialization option
const nes = cfxnes({rom: source});

// 2. Call nes.rom.load() method
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
| load(source) | `Promise` | Loads ROM image from the specified source. |
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

Module that provides access to NVRAM.

NVRAM (Non-Volatile RAM) is a memory that is usually battery-backed and serves as a place for game saves. NVRAM is only used by some games (e.g., The Legend of Zelda or Final Fantasy).

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| data | `Uint8Array` | no | `null` | Typed array that provides direct access to NVRAM data. The property is `null` when NVRAM is not avaialable. |

#### Methods

| Signature | Returns | Description |
|-----------|---------|-------------|
| load() | `Promise` | Loads NVRAM of the currently running game from IndexedDB. The method does nothing when there are no data to load or the NVRAM is not available. |
| save() | `Promise` | Stores NVRAM of the currently running game into IndexedDB. The method does nothing when the NVRAM is not available. |
| deleteAll() | `Promise` | Deletes all NVRAMs stored in IndexedDB. |

``` javascript
const nes = cfxnes();
const {rom, nvram} = nes;

nvram.save()                    // Persist NVRAM of the currently running game
  .then(() => rom.load(source)) // Load a different game
  .then(() => nvram.load())     // Restore its NVRAM
  .catch(error => {
    console.error('Oops!', error);
  });

// Clear NVRAM of the currently running game
if (nvram.data) {
  nvram.data.fill(0);
}

// Delete all stored NVRAMs.
nvram.deleteAll();
```

## nes.video

Display settings module.

Cfxnes requires a `canvas` element to render its video output. The canvas can be specified in several ways:

1. Create canvas element with `cfxnes` ID. It will be automatically used during cfxnes initialization.
2. Use `video.output` initialization option.
3. Use `nes.video.output` property.

``` html
<canvas id="cfxnes"><canvas>
<script>
  const canvas = document.getElementById('cfxnes');

  // 1. There is canvas element with 'cfxnes' ID.
  let nes = cfxnes();
  nes.video.output === canvas; // true

  // 2. Use 'video.output' initialization option.
  nes = cfxnes({
    video: {output: canvas}
  });

  // 3. Use 'nes.video.output' property
  nes.video.output = canvas;
</script>
```

In case there is no ROM image loaded, running emulator will display white noise as its video output.

Once the output is set it is not possible to change `renderer`. To change renderer, you need to use a different canvas with unitialized context (see example bellow).

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| output | `HTMLCanvasElement` | yes | `null` | Canvas element used to render emulator video output. The property can be set to `null` to disable rendering. |
| renderer | `string` | yes | `'webgl'` | Rendering back-end.<br>`'canvas'` - Rendering using Canvas API. It is used as fallback when WebGL is not available.<br>`'webgl'` - Rendering using WebGL. WebGL is typically faster than the `'canvas'` renderer, but this highly depends on browser, OS, graphic card driver, etc. |
| palette | `string` | yes | `'fceux'` | Palette used for generating RGB color values. Allowed values are:<br>`'asq-real-a'`, `'asq-real-b'`,<br>`'bmf-fin-r2'`, `'bmf-fin-r3'`,<br>`'fceu-13'`, `'fceu-15'`, `'fceux'`,<br>`'nestopia-rgb'`, `'nestopia-yuv'`<br>See [FCEUX documentation](http://www.fceux.com/web/help/fceux.html?PaletteOptions.html) for their description. |
| scale | `number` | yes | `1` | Canvas resolution multiplier. It must be larger than 0. Non-integer value might cause visual artifacts due to upscaling. The base resolution is 256x240.
| maxScale | `number` | no || The largest value of the `scale` property that does not cause canvas to overgrow `window.innerWidth`, `window.innerHeight`. |
| smoothing | `boolean` | yes | `false` | Enables smoothing effect for upscaled canvas resolution. |
| debug | `boolean` | yes | `false` | Enables additional video output (content of pattern tables and background/sprite palettes) to be rendered on canvas. This will also double width of the canvas. |

``` javascript
const nes = cfxnes();
const {video} = nes;


video.renderer = 'webgl'; // Renderer can be only changed before the output is set
video.output = document.getElementById('canvas-id'); // Set output
video.palette = 'nestopia-rgb'; // Set palette
video.scale = video.maxScale; // Set scale to max. value
video.smoothing = true; // Enable smoothing
video.debug = true; // Enable debug ouput

// To change renderer, we need a different canvas with unitialized context
video.output = null; // Disconnect the current canvas
video.renderer = 'canvas'; // Change the renderer
video.output = document.getElementById('another-canvas-id'); // Use a differnt canvas
```

## nes.fullscreen

Fullscreen module.

It's recommended to wrap used `canvas` element in extra `div` to make fullscreen working properly.

#### Properties

| Name | Type | Writable | Default | Description |
|------|------|----------|---------|-------------|
| is | `boolean` | no | false | `true` when the emulator is in fullscreen mode, `false` otherwise. |
| type | `string` | yes | `'maximized'` | Type of fullscreen mode.<br>`'maximized'` - Maximizes the output resolution while keeping its original aspect ratio.<br>`'normalized'` - Same as the `'maximazed'` type, but the output resolution is integer multiple of the base resolution 256x240. This should reduce visual artifacts caused by resolution upscaling.<br>`'stretched'` - Output is stretched to fill the whole screen (both horizontally and vertically). The original aspect ratio is not preserved.|

#### Methods

| Signature | Returns | Description |
|-----------|---------|-------------|
| enter() | `Promise` | Switches to fullscreen mode. The method does nothing when fullscreen is on. |
| exit() | `Promise` | Returns from fullscreen mode. The method does nothing when fullscreen is off. |

``` javascript
const nes = cfxnes();
const {fullscreen} = nes;

fullscreen.is; // false
fullscreen.type = 'stretched'; // Make fullscreen 'stretched'

// Note: Due to security reasons, browsers typically block fullscreen
//       requests that are not tied to user input (e.g., button click).
fullscreen.enter().then(() => {
  fullscreen.is; // true
}).catch(error => {
  console.error('Oops!', error); // Browser refused fullscreen request
});
```

## nes.audio

## nes.devices

## nes.inputs

## nes.options

