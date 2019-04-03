# Changelog

All notable changes to the cfxnes library will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2019-04-04

### Fixed

- No sound due to Chrome autoplay policy.

## [0.6.0] - 2017-11-22

### Fixed

- AMD export.
- Blocked `mouseup` events by running emulator.
- Error when loading certain iNES ROMs (*Donkey Kong 3*) due to being detected as NES 2.0.

### Added

- New color palettes: `'sony-cxa2025as'`, `'unsaturated-v6'`.
- `input.state` submodule for accessing state of device inputs.
- `video.clear()` method for clearing canvas.

### Changed

- Better error messages.
- Required JSZip version is `^3.1.0`.
- Initialization options with `undefined` value are ignored.
- `video.smoothing` property replaced by `video.filter`.
- `config.set()` method renamed to `config.use()`.
- `input.*` mapping methods replaced by `input.map` submodule.

## [0.5.0] - 2016-09-29

### Fixed

- Delayed IRQ response after CLI/SEI/PLP (*Break Time* is now playable).
- MMC3 mapper alternate behavior.
- Sprite overflow flag clearing.
- Sprite zero hit detection.
- Disabled audio in Safari.

### Added

- Support for setting independent volume of each audio channel through `audio.volume` property.
- Support for Blob as a ROM source.

### Removed

- API for configuration and NVRAM persistance.

### Changed

- **Complete API overhaul**.
- Checksums are computed using SHA-1 from PRG RAM and CHR RAM.
- Multiple cfxnes instances share the same `AudioContext`.
- js-md5 and screenfull.js dependencies are no longer needed.
- `video.scale` can be any real number > 0.

## [0.4.0] - 2015-11-29

### Fixed

- Detection of NES 2.0 ROM image format.
- Size of PRG/CHR RAM read from ROM images (iNES / NES 2.0).
- MMC1 mapper implementation (PRG RAM protection, PRG ROM mapping).
- MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).

### Added

- Support for BNROM, NINA-001 and Color Dreams mappers.
- New color palettes: ASQ, BMF, FCEU(X), Nestopia.
- Multiple types of fullscreen mode.
- API for configuration and NVRAM persistance.
- API for setting logging level.

### Changed

- API uses Promises for asynchronous operations.
- Non-volatile RAM is stored in IndexedDB.
- Default audio volume is 50%.

## [0.3.0] - 2015-08-09

### Fixed

- Mouse cursor detection for Zapper.

### Added

- Gamepad support.

### Changed

- Library can be loaded as AMD or CommonJS module.
- Input files with size over 10MB are rejected.

## [0.2.0] - 2015-05-18

### Fixed

- MMC3 mapper initial state (*SMB3* and *Shadow of the Ninja* are now playable).
- Initialization in Internet Explorer.

## Added

- Support for loading of zipped `.nes` files.

### Changed

- js-md5 and screenfull.js are optional dependencies.

## 0.1.0 - 2015-04-26

- Initial version.

[0.7.0]: https://github.com/jpikl/cfxnes/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/jpikl/cfxnes/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/jpikl/cfxnes/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jpikl/cfxnes/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0
