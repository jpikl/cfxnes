# CFxNES

A Nintendo Entertainment System emulator written in ECMAScript 6.

![CFxNES logo](https://raw.githubusercontent.com/jpikl/cfxnes/master/client/images/logo-md.png)

Try CFxNES out at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

CFxNES is in early development, so many of the NES games are not playable yet.
For best berformance, at least 2 GHz CPU and the **latest Google Chrome** or **Firefox**
are recommended.

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Building and Running

    npm install
    bower install
    gulp

or alternatively

    npm install
    ./node_modules/bower/bin/bower install
    ./node_modules/gulp/bin/gulp.js

Application is running at <http://localhost:5000>.

## Game Library

Put your *.nes* ROM files inside the `roms` directory to see them in game library.

To have custom thumbnails you have to add image with the same as the ROM file.
E.g., thumbnail for `Super Mario Bros.nes` should be named `Super Mario Bros.jpg`.
Supported image formats are *JPG*, *PNG* and *GIF*.
