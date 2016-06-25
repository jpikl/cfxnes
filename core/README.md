# CFxNES Core

Collection of JavaScript components that forms core of the [CFxNES emulator](../README.md). The core can be independently used in browser or in Node.js environment.

When using components, it is highly recommended to compile the result with the [closure compiler](https://github.com/google/closure-compiler) in `ADVANCED_OPTIMIZATIONS` mode to gain the best performance.

## Initialization

``` javascript
import NES from './NES';

const nes = new NES;
```

NES constructor allows to pass custom implementation of any internal unit (CPU, PPU, APU, DMA, CPUMemory, PPUMemory). This is mainly used for their mocking/customization in tests.

``` javascript
const nes = new NES({cpu: customCPU});
```

### Loading of ROM images

ROM images can be load from `Array`, `ArrayBuffer`, `Uint8Array` or from a file system path when running in Node.js. Supported formats are *iNES* and *NES 2.0*.

``` javascript
import {createCartridge, readCartridge} from './data/cartridge';

const cartridge1 = createCartridge([ /* data */ ]); // From buffer
const cartridge2 = readCartridge('./data/rom.nes'); // From filesystem

nes.insertCartridge(cartridge1);
```

### Rendering loop

Video output is rendered into provided `Uint32Array`. Color of each pixel is encoded as 32-bit unsigned integer in RGBA format.

``` javascript
const videoBuffer = new Uint32Array(256 * 240); // Screen resolution
while (running) {
    nes.renderFrame(videoBuffer);
    // Display output buffer
    // Add delay to run loop at speed of 60 FPS (NTSC) or 50 FPS (PAL)
}
```

### Audio Output

Audio samples are automatically recorded into internal `Float32Array`. This buffer should be periodically read and send to a sound card.

Buffer underflow/overflow is automatically managed by dynamical adjustment of sampling rate.

``` javascript
nes.setAudioBufferSize(4096); // 4 KB audio buffer
nes.setAudioSampleRate(44100); // 44.1 KHz sampling rate
nes.setAudioEnabled(true); // Initially disabled

function audioCallback() {
    const audioBuffer = nes.readAudioBuffer();
    // Supply audio samples to sound card
}

// Rendering loop
```

### Input devices

Standard NES controller (joypad) and Zapper are supported.

``` javascript
import Joypad from './devices/Joypad';
import Zapper from './devices/Zapper';

const joypad = new Joypad;
nes.setInputDevice(1, joypad); // Port 1
joypad.setButtonPressed(Joypad.START, true);

const zapper = new Zapper;
nes.setInputDevice(2, zapper); // Port 2
zapper.setBeamPosition(128, 120);
zapper.setTriggerPressed(true);
```

## Tests

Run unit tests:

    gulp test-base

Run tests for [validation ROMs](http://wiki.nesdev.com/w/index.php/Emulator_tests):

    gulp test-roms

Run all:

    gulp test
