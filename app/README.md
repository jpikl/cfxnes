# CFxNES application

Web application build on top of the [CFxNES library](../lib).

Live demo is available at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

## Building and Running

1) Build the [CFxNES library](../lib) as described in 
   [here](../lib#building) (either minified or debug version).

2) Install dependencies:

    npm install

3) Build application in the `dist` directory:
    
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
