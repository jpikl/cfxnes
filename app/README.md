# CFxNES App

Web application build on top of the [CFxNES Lib](../lib).

Live demo is available at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com)

## Building and Running

1) [Build the library](../lib/README.md#user-content-building).

2) Build the application.

    gulp build

3) Run the application at <http://localhost:5000>.

    node dist/app.js

## Library

Server scans the `dist/roms` directory for any *.nes* ROM images which are then displayed on the *Library* page.

If a picture with the same name as the ROM image is found, it will be used as its thumbnail. E.g., thumbnail for `rom_image.nes` should be named `rom_image.jpg`. Supported formats are *JPG*, *PNG* and *GIF*.
