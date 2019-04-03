# Changelog

All notable changes to the cfxnes application will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2019-04-04

### Fixed

- No sound due to Chrome autoplay policy.

### Added

- Overlay for paused emulator.
- Loading transition.

### Changed

- Better colors of controls info panel for dark theme.
- No autoplay when app is started directly from emulator page.

## [0.6.0] - 2017-11-22

### Fixed

- Error when loading certain iNES ROMs (*Donkey Kong 3*) due to being detected as NES 2.0.

### Added

- Home screen.
- Keyboard shortcuts.
- Light and dark theme.
- Option to change mouse cursor to crosshair.
- Option to bind multiple keys/buttons to the same input.
- New color palettes: SONY CXA2025AS US, Unsaturated V6.
- **Server:** Configuration through file or environment variables.
- **Server:** gzip Content-Encoding support.

### Changed

- Complete UI rewrite in React/Redux.
- *WebGL rendering* video option replaced by *Renderer* select.
- *Smoothing* video option replaced by *Filter* select.
- *Joypad* device renamed to *Controller*.
- Cleaner URL paths without hash mark `#`.
- Active settings panel is part of URL.
- Active library item no longer disappears from URL.
- Controls info panel displays devices and key bindings for both ports.
- Closing controls info panel will toggle corresponding configuration option.
- Library is no longer being reinitialized every time it is displayed.
- Better (more responsive) header UI.
- Better confirmation dialogs.

## [0.5.0] - 2016-09-29

### Fixed

- Delayed IRQ response after CLI/SEI/PLP (*Break Time* is now playable).
- MMC3 mapper alternate behavior.
- Sprite overflow flag clearing.
- Sprite zero hit detection.
- Disabled audio in Safari.

### Added

- Option to set independent volume of each audio channel.
- Warning message for disabled JavaScript.

### Changed

- Checksums are computed using SHA-1 from PRG RAM and CHR RAM.

## [0.4.0] - 2015-11-29

### Fixed

- Detection of NES 2.0 ROM image format.
- Size of PRG/CHR RAM read from ROM images (iNES / NES 2.0).
- MMC1 mapper implementation (PRG RAM protection, PRG ROM mapping).
- MMC3 mapper implementation (PRG RAM protection, CHR ROM mapping).
- Crash during attempt to load invalid configuration.

### Added

- Support for BNROM, NINA-001 and Color Dreams mappers.
- New color palettes: ASQ, BMF, FCEU(X), Nestopia.
- Multiple types of fullscreen mode.
- Option to reset configuration.
- Option to delete saved NVRAM data.

### Changed

- *Game Library* renamed to *Library*.
- Only a single reload when multiple files are changed in library directory.
- Non-volatile RAM is stored in IndexedDB.
- Vector graphics used where possible.
- Default audio volume is 50%.

## [0.3.0] - 2015-08-09

### Fixed

- Mouse cursor detection for Zapper.
- SVG images scaling in Internet Explorer.

### Added

- Gamepad support.

### Changed

- Complete UI rewrite in Riot.js.
- *TV system* option renamed to *Region*.
- Input files with size over 10MB are rejected.

## [0.2.0] - 2015-05-18

### Fixed

- MMC3 mapper initial state (*SMB3* and *Shadow of the Ninja* are now playable).
- Initialization in Internet Explorer.

## Added

- Support for loading of zipped `.nes` files.
- Drag 'n' drop visual effect.
- Option to hide FPS counter.
- Favicon.

### Changed

- UI optimization for small screens.

## 0.1.0 - 2015-04-26

- Initial version.

[0.7.0]: https://github.com/jpikl/cfxnes/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/jpikl/cfxnes/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/jpikl/cfxnes/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jpikl/cfxnes/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jpikl/cfxnes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jpikl/cfxnes/compare/v0.1.0...v0.2.0
