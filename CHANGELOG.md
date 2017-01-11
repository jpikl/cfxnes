# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
### Changed
- Library uses JSZip 3.x.x for unzipping.
- Library video.smoothing property replaced by video.filter.

## [0.5.0] - 2016-09-29
### Fixed
- MMC3 mapper alternate behavior.
- Delayed IRQ response after CLI/SEI/PLP (*Break Time* is now playable).
- Sprite zero hit detection.
- Sprite overflow flag clearing.
- Disabled audio in Safari.

### Added
- Option to set volume of each audio channel.
- Warning message for disabled JavaScript.

### Changed
- New library API.
- Checksums are computed using SHA-1 from PRG RAM and CHR RAM.
- js-md5 and screenfull.js dependencies are no longer needed.
- Video scale can be any real number > 0.

## [0.4.0] - 2015-11-29
### Fixed
- Detection of NES 2.0 ROM image format.
- Correct size of PRG/CHR RAM that is read from ROM images (iNES / NES 2.0).
- MMC1 mapper implementation (PRG RAM protection, PRG ROM mapping).
- MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).
- Crash during attempt to load invalid configuration.

### Added
- Support for BNROM, NINA-001 and Color Dreams mappers.
- New color palettes: ASQ, BMF, FCEU(X), Nestopia.
- API to change loggging level.
- Multiple types of fullscreen mode.
- Option to reset configuration.
- Option to delete saved game data.

### Changed
- Non-volatile RAM is stored in IndexedDB.
- API uses Promises for asynchronous operations.
- Default audio volume is 50%.
- Vector graphics is used where possible.
- Only single reload when multiple files are changed in library directory.
- *Game Library* renamed to *Library*.

## [0.3.0] - 2015-08-09
### Fixed
- Mouse cursor detection for zapper.

### Added
- Gamepad support.

### Changed
- Library can be loaded as AMD or CommonJS module.
- Complete UI rewrite (switched from AngularJS to RiotJS).
- *TV system* configuration option renamed to *Region*.

## [0.2.0] - 2015-05-18
### Fixed
- MMC3 mapper initial state (*SMB3* and *Shadow of the Ninja* are now playable).
- Compatibility with Babel compiler (v5.4.3).
- Compatibility with Closure Compiler (v20150505).
- Emulator initialization in Internet Explorer.

## Added
- Support for loading of zipped `.nes` files.
- Visual effect when dropping files into browser window.
- Option to hide FPS counter.
- Favicon.

### Changed
- js-md5 and screenfull.js library are optional dependencies.
- UI optimization for small screens.

## 0.1.0 - 2015-04-26
- Complete rewrite from CoffeeScript to ECMAScript 6.

[unreleased]: https://github.com/jpikl/cfxnes/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/jpikl/cfxnes/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jpikl/cfxnes/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0
