# cfxnes

JavaScript NES emulator and emulation library.

![cfxnes logo](app/src/client/images/logo.png)

:video_game: Try out [cfxnes online](http://cfxnes.herokuapp.com).

:information_source: See [how to use cfxnes as a library](lib).

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Features

- Supported ROM images: iNES, NES 2.0.
- Supported mappers: NROM, MMC1, MMC3, UNCOM, CNROM, AOROM, BNROM, NINA-001, Color Dreams.
- ROM images can be loaded from ZIP archive.
- Persistence of battery-backed RAM (game saves) in IndexedDB.
- Rendering using WebGL (with canvas API fallback).
- Fullscreen mode.
- Sound emulation using Web Audio.
- Zapper emulation using mouse.
- Gamepad support.
- Customizable key bindings.
- Plenty of configuration options.

## Supported Browsers

- Chrome 49+
- Firefox 47+
- IE 11, Edge 12+
- Opera 38+
- Safari 9+

## Known Issues

- No sound in IE due to missing Web Audio support.
- Poor performance in IE, Edge.
- Very poor performance on mobile devices.
- Occasional graphical glitches in games using MMC3 mapper.
- See [list of broken games](docs/broken-games.md).

## Project Structure

- [core](core) - core components of the emulator
- [lib](lib) - library for NES emulation in web browser
- [app](app) - web application built on top of the library
