# CFxNES

JavaScript NES emulator and emulation library.

![CFxNES logo](app/src/client/images/logo.png)

Try CFxNES out at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

For the best performance, at least 2 GHz CPU and the **latest Google Chrome**
or **Firefox** are recommended.

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Main Features

- Loading of iNES and NES 2.0 ROM images.
- Loading of zipped ROM images.
- Supported mappers: NROM, MMC1, MMC3, UNCOM, CNROM, AOROM, BNROM, NINA-001.
- Persistence of battery-backed RAM (game saves) in IndexedDB.
- Rendering using WebGL (with canvas fallback).
- Full screen mode.
- Sound emulation using Web Audio.
- Zapper emulation using mouse.
- Gamepad input support.
- Customizable key bindings.
- Plenty of configuration options.
- Game library.

## Known Issues

- No sound in Internet Explorer (and in [other browsers](http://caniuse.com/#feat=audio-api) than do not support Web Audio).
- Occasional graphical glitches in games using MMC3 mapper.
- See [list of broken games](broken_games.md).

## Project Structure

- [cfxnes-core](core) - core components of the emulator.
- [cfxnes-lib](lib) - library for NES emulation in web browser.
- [cfxnes-app](app) - web application build on top of the library.
- [cfxnes-dbg](dbg) - tool for debugging NES ROM images.

## How to Setup Development Environment

1) Install `make`, `nodejs` and `npm`.

2) Install build tools:

    npm install -g gulpjs/gulp-cli#4.0
    npm install -g npm-check-updates

3) Install project dependencies:

    make install_deps

## Useful make targets

Build both library (minified and debug version) and application:

    make build_all

Build library in debug mode + watch changes:

    make dev_lib

Build application in debug mode + watch changes + run browser sync:

    make dev_app

Run all tests:

    make test
