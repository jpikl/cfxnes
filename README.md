# cfxnes

JavaScript NES emulator and emulation library.

![cfxnes logo](app/src/client/images/logo.png)

Try out cfxnes at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com)

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Features

- Loading of iNES and NES 2.0 ROM images.
- Loading of zipped ROM images.
- Supported mappers: NROM, MMC1, MMC3, UNCOM, CNROM, AOROM, BNROM, NINA-001, Color Dreams.
- Persistence of battery-backed RAM (game saves) in IndexedDB.
- Rendering using WebGL.
- Full screen mode.
- Sound emulation using Web Audio.
- Zapper emulation using mouse.
- Gamepad support.
- Customizable key bindings.
- Plenty of configuration options.

## Supported Browsers

- Chrome 49+
- Firefox 47+
- Edge 13+
- Opera 38+

## Known Issues

- Poor performance in Edge.
- Very poor performance on mobile devices.
- Occasional graphical glitches in games using MMC3 mapper.
- See [list of broken games](docs/broken-games.md).

## Project Structure

- [core](core) - core components of the emulator
- [lib](lib) - library for NES emulation in web browser
- [app](app) - web application built on top of the library
