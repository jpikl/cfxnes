# CFxNES Core

Collection of JavaScript classes that forms core of the [CFxNES emulator](../README.md). The core can be independently used in browser or in Node.js environment.

When using components from CFxNES core, it is highly recommended to compile the result with the [closure compiler](https://github.com/google/closure-compiler) in `ADVANCED_OPTIMIZATIONS` mode to gain significant performance boost.

## Initialization

``` javascript
import NES from './NES';

const nes = new NES;
```

NES constructor allows to pass different implementation of base components (CPU, PPU, APU, etc.). This is mainly used for their mocking/customization for various tests.

``` javascript
import LoggingCPU from './units/special/LoggingCPU';
import BufferedOutputPPU from './units/special/BufferedOutputPPU';

const cpu = new LoggingCPU;
const ppu = new BufferedOutputPPU;
const nes = new NES({cpu, ppu});
```

### Loading of ROM images

Core is capable of loading *iNES* and *NES 2.0* ROM images which can be supplied as `Array`, `ArrayBuffer`, `Uint8Array` or as a file system path (when running in Node.js).

``` javascript
import {createCartridge, readCartridge} from './cartridge';

const cartridge1 = createCartridge([...]); // From buffer
const cartridge2 = readCartridge('./data/rom.nes'); // From filesystem

nes.insertCartridge(cartridge1);
```

### Rendering loop

Video output is rendered into provided `Uint32Array`. Color of each pixel is encoded as 32-bit unsigned integer in RGBA format.

``` javascript
const videoBuffer = new Uint32Array(256 * 240); // Screen resolution
while(running) {
    nes.renderFrame(videoBuffer);
    // Display output buffer
    // Add delay to run loop at speed of 60 FPS (NTSC) / 50 FPS (PAL)
}
```

### Audio Output

Audio samples are automatically recorded into internal `Float32Array`. This buffer should be periodically read and send to an audio device (for example, through Web Audio).

Buffer underflow/overflow is automatically managed by dynamical adjustment of sampling rate.

``` javascript
nes.initAudioRecording(4096); // 4K audio buffer
nes.startAudioRecording(44100); // 44.1 KHz sampling rate

function audioCallback() {
    const audioBuffer = nes.readAudioBuffer();
    // Supply audio samples to audio device
}

// Rendering loop

nes.stopAudioRecording();
```

### Input devices

Core can emulate standard NES controller (joypad) and Zapper.

``` javascript
import {Joypad, Zapper} from './devices'

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

Run tests for various [validation ROMS](http://wiki.nesdev.com/w/index.php/Emulator_tests):

    gulp test-roms

Run everything:

    gulp test
