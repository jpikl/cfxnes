# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
### Fixed
- Detection of NES 2.0 ROM image format.
- Correct size of PRG/CHR RAM that is read from ROM images (iNES / NES 2.0).
- MMC1 mapper imlementation (PRG RAM protection, PRG ROM mapping).
- MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).

### Added
- API to change loggging level.

## [0.3.0] - 2015-08-09
### Fixed
- Mouse cursor detection for zapper.

### Added
- Gamepad support.

### Changed
- Complete UI rewrite (switched from AngularJS to RiotJS).
- Emulator library can be loaded as AMD or CommonJS module.
- *TV system* configuration option renamed to *Region*.

## [0.2.0] - 2015-05-18
### Fixed
- Emulator initialization in Internet Explorer.
- Build process initialization on Windows.
- MMC3 mapper initial state (SMB3 and Shadow of the Ninja games are now playable).
- Compatibility with Closure Compiler (v20150505).
- Compatibility with Babel compiler (v5.4.3).

## Added
- Support for loading zipped `.nes` files.
- Visual effect when dropping files into browser window.
- Option to hide FPS counter.
- Favicon.

### Changed
- UI optimization for small screens.
- js-md5 and screenfull library are optional dependencies.

## 0.1.0 - 2015-04-26
- Complete rewrite from CoffeeScript to ECMAScript 6.

[unreleased]: https://github.com/jpikl/cfxnes/compare/v0.3.0...HEAD
[0.3.0]:      https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0
[0.2.0]:      https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0
