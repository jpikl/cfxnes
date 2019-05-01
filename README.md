# cfxnes

JavaScript NES emulator and emulation library.

![cfxnes logo](logo.png)

:video_game: [Live demo](https://cfxnes.herokuapp.com)

:information_source: [How to use cfxnes as a library](lib)

## Features

- Supported ROM images: iNES, NES 2.0.
- Supported mappers: NROM, MMC1, MMC3, UNROM, CNROM, AOROM, BNROM,
  NINA-001, Color Dreams.
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

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Opera (last 2 versions)
- IE 11, Edge >= 12
- Safari >= 9

## Known Issues

- No sound in IE due to missing Web Audio support.
- Poor performance in IE, Edge.
- Very poor performance on mobile devices.
- Occasional graphical glitches in games using MMC3 mapper.
- See [list of broken games](broken-games.md).

## Project Structure

- **[Core](core)** - [Readme](core/README.md)
- **[Lib](lib)** - [Readme](lib/README.md)
                 / [Changelog](lib/CHANGELOG.md)
                 / [API](lib/API.md)
                 / [Examples](lib/examples)
- **[App](app)** - [Readme](app/README.md)
                 / [Changelog](app/CHANGELOG.md)

## License

Cfxnes is licensed under the [MIT license](LICENSE.md).
