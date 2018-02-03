# cfxnes (core)

Core of the [cfxnes emulator](../README.md).

Its components can be used independently in browser or in Node.js environment.

For better performance, these components can be compiled with [closure compiler](https://github.com/google/closure-compiler) in `ADVANCED` optimization mode.

## Initialization

``` javascript
import {NES} from 'cfxnes-core';

const nes = new NES;
```

NES constructor allows to pass custom implementation of any internal unit (CPU, PPU, APU, DMA, CPUMemory, PPUMemory). This is mainly used for their mocking/customization in tests.

``` javascript
const nes = new NES({cpu: customCPU});
```

## ROM Images

ROM image can be loaded from `Uint8Array` or from a file system path when running in Node.js. Supported formats are **iNES** and **NES 2.0**.

``` javascript
import {createCartridge, readCartridge} from 'cfxnes-core';

// From buffer
const cartridge1 = createCartridge(uint8Array);
nes.setCartridge(cartridge1);

// From file system
const cartridge2 = readCartridge('./data/rom.nes');
nes.setCartridge(cartridge2);
```

## Rendering Loop

Video output is rendered into provided `Uint32Array(256 * 240)` buffer. Color of each pixel is encoded as 32-bit unsigned integer in RGBA format. Their values are generated using specified `Uint32Array(64)` palette.

``` javascript
import {createPalette, VIDEO_WIDTH, VIDEO_HEIGHT} from 'cfxnes-core';

const palette = createPalette('fceux'); // Predefined palette
nes.setPalette(palette);

const videoBuffer = new Uint32Array(VIDEO_WIDTH * VIDEO_HEIGHT);
while (running) {
    nes.renderFrame(videoBuffer);
    // Display video buffer
    // Add delay to run loop at speed of 60 FPS (NTSC) or 50 FPS (PAL)
}
```

## Audio Output

During the rendering loop, audio samples are generated at a specified rate. These samples are then passed to a provided callback function.

``` javascript
nes.setAudioSampleRate(44100); // 44.1 KHz sampling rate
nes.setAudioCallback(audioSample => { /* Handle audio sample. */ });

// Rendering loop
```

## Input Devices

``` javascript
import {Button, Joypad, Zapper} from 'cfxnes-core';

// Standard NES controller
const joypad = new Joypad;
nes.setInputDevice(1, joypad); // Port #1
joypad.setButtonPressed(Button.START, true);

// Zapper
const zapper = new Zapper;
nes.setInputDevice(2, zapper); // Port #2
zapper.setBeamPosition(128, 120);
zapper.setTriggerPressed(true);
```

## Development

| `npm run <script>` | Description                                       |
| ------------------ | ------------------------------------------------- |
| `lint`             | Run linter.                                       |
| `test`             | Run all tests.                                    |
| `test:base`        | Run tests for source modules.                     |
| `test:roms`        | Run tests that are using various validation ROMs. |
| `clean`            | Clean all generated files.                        |
