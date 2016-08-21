# CFxNES / core

Collection of JS components that form core of the [CFxNES emulator](../README.md). The core can be independently used in browser or in Node.js environment.

For better performance, components can be compiled with [closure compiler](https://github.com/google/closure-compiler) in `ADVANCED_OPTIMIZATIONS` mode.

## Development

Run `gulp` to see available task and their options.


## Usage

### Initialization

``` javascript
import NES from './NES';

const nes = new NES;
```

NES constructor allows to pass custom implementation of any internal unit (CPU, PPU, APU, DMA, CPUMemory, PPUMemory). This is mainly used for their mocking/customization in tests.

``` javascript
const nes = new NES({cpu: customCPU});
```

### ROM images

ROM images can be loaded from `Array`, `ArrayBuffer`, `Uint8Array` or from a file system path when running in Node.js. Supported formats are **iNES** and **NES 2.0**.

``` javascript
import {createCartridge, readCartridge} from './data/cartridge';

// From buffer
const cartridge1 = createCartridge([ /* data */ ]);
nes.setCartridge(cartridge1);

// From filesystem
const cartridge2 = readCartridge('./data/rom.nes');
nes.setCartridge(cartridge2);
```

### Rendering loop

Video output is rendered into provided `Uint32Array(256 * 240)` buffer. Color of each pixel is encoded as 32-bit unsigned integer in RGBA format. Their values are generated using using specified `Uint32Array(64)` palette.

``` javascript
import {VIDEO_BUFFER_SIZE} from './video/constants';
import {createPalette} from './video/palettes';

const palette = createPalette('fceux'); // Returns predefined palette
nes.setPalette(palette);

const videoBuffer = new Uint32Array(VIDEO_BUFFER_SIZE);
while (running) {
    nes.renderFrame(videoBuffer);
    // Display output buffer
    // Add delay to run loop at speed of 60 FPS (NTSC) or 50 FPS (PAL)
}
```

### Audio Output

Audio samples are automatically recorded into internal `Float32Array`. This buffer should be periodically read and send to a sound card. Buffer underflow/overflow is automatically managed by dynamical adjustment of sampling rate.

``` javascript
nes.setAudioBufferSize(4096); // 4K audio buffer
nes.setAudioSampleRate(44100); // 44.1 KHz sampling rate
nes.setAudioEnabled(true); // Disabled by default

function audioCallback() {
    const audioBuffer = nes.readAudioBuffer();
    // Supply audio samples to sound card
}

// Rendering loop
```

### Input devices

``` javascript
import Joypad from './devices/Joypad';
import Zapper from './devices/Zapper';

// Standard NES controller
const joypad = new Joypad;
nes.setInputDevice(1, joypad); // Port #1
joypad.setButtonPressed(Joypad.START, true);

// Zapper
const zapper = new Zapper;
nes.setInputDevice(2, zapper); // Port #2
zapper.setBeamPosition(128, 120);
zapper.setTriggerPressed(true);
```
