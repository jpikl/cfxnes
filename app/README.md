# CFxNES application

Web application build on top of the [CFxNES library](../lib).

Live demo is available at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

## Building and Running

1) [Set up your development environment](../docs/dev-environment.md).

2) [Build the library](../lib/README.md#user-content-building).

3) Build the application:
    
    gulp build

4) Run the application at <http://localhost:5000>:

    node dist/app.js

## Game Library

Put your *.nes* ROM image files inside the `dist/roms` directory to make 
them available in game library.

To have custom thumbnails you have to add image with the same name 
as the ROM image file. E.g., thumbnail for `Super Mario Bros.nes` 
should be named `Super Mario Bros.jpg`. Supported image formats are 
*JPG*, *PNG* and *GIF*.
