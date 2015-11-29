# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

Each change is prefixed with code of related module:
- *core* = emulator core
- *lib* = emulation library
- *app* = web application
- *dbg* = debugger

## [0.4.0] - 2015-11-29
### Fixed
- [core] Detection of NES 2.0 ROM image format.
- [core] Correct size of PRG/CHR RAM that is read from ROM images (iNES / NES 2.0).
- [core] MMC1 mapper implementation (PRG RAM protection, PRG ROM mapping).
- [core] MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).
- [core, lib] Attempt to load invalid configuration won't crash emulator during initialization.

### Added
- [core] Support for BNROM, NINA-001 and Color Dreams mappers.
- [core, app] - New color palettes: ASQ, BMF, FCEU(X), Nestopia.
- [lib] API to change loggging level.
- [lib, app] Multiple fullscreen modes.
- [app] Option to reset configuration.
- [app] Option to delete saved game data.
- [dbg] Debugger can take screenshots.
- [dbg] Debugger command line options `-i` and `-p`.

### Changed
- [core] Cartridge data (battery backed RAM) is stored in IndexedDB.
- [core, lib] API uses Promises for asynchronous operations.
- [lib, app] Default audio volume is 50%.
- [app] Vector graphics is used where possible.
- [app] Only single refresh when multiple files are changed in library.
- [app] *Game Library* renamed to *Library*.

## [0.3.0] - 2015-08-09
### Fixed
- [lib] Mouse cursor detection for zapper.

### Added
- [lib, app] Gamepad support.

### Changed
- [lib] Library can be loaded as AMD or CommonJS module.
- [app] Complete UI rewrite (switched from AngularJS to RiotJS).
- [app] *TV system* configuration option renamed to *Region*.

## [0.2.0] - 2015-05-18
### Fixed
- [core] MMC3 mapper initial state (SMB3 and Shadow of the Ninja games are now playable).
- [core] Compatibility with Babel compiler (v5.4.3).
- [core, lib] Compatibility with Closure Compiler (v20150505).
- [lib, app] Emulator initialization in Internet Explorer.

## Added
- [core] Support for loading of zipped `.nes` files.
- [app] Visual effect when dropping files into browser window.
- [app] Option to hide FPS counter.
- [app] Favicon.

### Changed
- [core, lib] js-md5 and screenfull library are optional dependencies.
- [app] UI optimization for small screens.

## 0.1.0 - 2015-04-26
- Complete rewrite from CoffeeScript to ECMAScript 6.

[0.4.0]: https://github.com/jpikl/cfxnes/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0
