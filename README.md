# CFxNES

JavaScript NES emulator and emulation library.

![CFxNES logo](app/src/client/images/logo.png)

Try out CFxNES at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com)

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Features

- Loading of iNES and NES 2.0 ROM images.
- Loading of zipped ROM images.
- Supported mappers: NROM, MMC1, MMC3, UNCOM, CNROM, AOROM, BNROM, NINA-001, Color Dreams.
- Persistence of battery-backed RAM (game saves) in IndexedDB.
- Rendering using WebGL (with canvas API as fallback).
- Full screen mode.
- Sound emulation using Web Audio.
- Zapper emulation using mouse.
- Gamepad support.
- Customizable key bindings.
- Plenty of configuration options.

## Browser Compatibility

- Chrome >= 44
- Firefox >= 40
- Internet Explorer 11 (with [polyfill](lib/README.md#user-content-browser-compatibility))
- Edge >= 12

## Known Issues

- No sound in Internet Explorer (and in [other browsers](http://caniuse.com/#feat=audio-api) that do not support Web Audio).
- Poor performance in Internet Explorer and Edge.
- Very poor performance on mobile devices.
- Occasional graphical glitches in games using MMC3 mapper.
- See [list of broken games](docs/broken-games.md).

## Project Structure

- [cfxnes-core](core) - core components of the emulator.
- [cfxnes-lib](lib) - library for NES emulation in web browser.
- [cfxnes-app](app) - web application build on top of the library.
- [cfxnes-dbg](dbg) - tool for debugging NES ROM images.
