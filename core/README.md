# CFxNES Core

Collection of JavaScript classes that forms core of the [CFxNES emulator](../README.md). The core can be independently used in browser or in Node.js environment.

When using components from CFxNES core, it is highly recommended to compile the result with the [closure compiler](https://github.com/google/closure-compiler) in `ADVANCED_OPTIMIZATIONS` mode to gain significant performance boost.

## Basic Principles and Usage

### Dependency Injection

The core uses its own [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) (DI) mechanism to supply implementation of emulator components (CPU, PPU, APU, etc.). DI allows easy replacement of any emulator component with a different implementation. This is mainly used for mocking/customizing components for various emulator tests.

``` javascript
import Injector from './utils/Injector'; // Dependency injector
import config from './config'; // Base DI configuration

var injector = new Injector(config);
var nes = injector.get('nes');
```

### Loading of ROM images

Core is capable of loading *iNES* and *NES 2.0* ROM images which can be supplied as `ArrayBuffer`, `Uint8Array` or as a file system path (when running in Node.js).

``` javascript
var cartridgeFactory = injector.get('cartridgeFactory');
var cartridge = cartridgeFactory.readArray(arrayBuffer);
// Or alternatively cartridgeFactory.readFile(path)
nes.insertCartridge(cartridge);
```

### Rendering loop

Video output is rendered into provided `Uint32Array`. Color of each pixel is encoded as 32-bit unsigned integer in RGBA format.

``` javascript
var videoBuffer = new Uint32Array(256 * 240); // Screen resolution
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
    var audioBuffer = nes.readAudioBuffer();
    // Supply audio samples to audio device
}

// Rendering loop

nes.stopAudioRecording();
```

### Input devices

Core can emulate standard NES controller (joypad) and Zapper.

``` javascript
import {Button} from './devices/Joypad'

var deviceFactory = injector.get('deviceFactory');
var joypad = deviceFactory.createDevice('joypad');
var zapper = deviceFactory.createDevice('zapper');

nes.connectInputDevice(1, joypad); // Port 1
joypad.setButtonPressed(Button.START, true);

nes.connectInputDevice(2, zapper); // Port 2
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
