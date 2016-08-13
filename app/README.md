# CFxNES App

Web application build on top of the [CFxNES Lib](../lib).

Live demo is available at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com)

## Building

Run `gulp` to see available task and their options.

*Note:* [Library](../lib) needs to be build separately before building the application.

## Library

Server scans the `dist/roms` directory for any *.nes* ROM images which are then displayed on the *Library* page.

If a picture with the same name as the ROM image is found, it will be used as its thumbnail. E.g., thumbnail for `rom_image.nes` should be named `rom_image.jpg`. Supported formats are *JPG*, *PNG* and *GIF*.
