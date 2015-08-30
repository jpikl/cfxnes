# CFxNES

A Nintendo Entertainment System emulator written in ECMAScript 6.

![CFxNES logo](https://raw.githubusercontent.com/jpikl/cfxnes/master/src/app/client/images/logo.png)

Try CFxNES out at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

CFxNES is in early development, so many of the NES games are not playable yet.
For best berformance, at least 2 GHz CPU and the **latest Google Chrome** or **Firefox**
are recommended.

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Building and Running

    npm install
    npm run build
    npm start

Application is running at <http://localhost:5000>.

## Game Library

Put your *.nes* ROM files inside the `dist/app/roms` directory to make them available in game library.
On non-Widows platforms, symbolic link `roms` to this directory is automatically created.

To have custom thumbnails you have to add image with the same name as the ROM file.
E.g., thumbnail for `Super Mario Bros.nes` should be named `Super Mario Bros.jpg`.
Supported image formats are *JPG*, *PNG* and *GIF*.

## Using CFxNES as a library

*The library API is currently unstable and undocumented.*

CFxNES can be used as a JS library to run NES games on your website.
The source code below provides a minimal example how to setup and run emulator.

The library requires browser that supports [Promises](https://promisesaplus.com/).
You can use [polyfill](https://www.promisejs.org/polyfills/promise-7.0.1.min.js)
to make it working in Internet Explorer, Firefox (< 29) and Chrome (< 32).

``` html
<!DOCTYPE html>
<html>
<head>
    <title>CFxNES</title>
    <script type="text/javascript" src="//www.promisejs.org/polyfills/promise-7.0.1.min.js"></script>
    <script type="text/javascript" src="cfxnes.js"></script>
    <script type="text/javascript">
        window.onload = function() {
            var cfxnes = new CFxNES;
            cfxnes.setVideoOutput(document.getElementById("canvas"));
            cfxnes.downloadCartridge("game.nes").then(function() {
                cfxnes.start(); // Success, run the game.
            }).catch(function(error) {
                alert(error);
            });
        };
    </script>
</head>
<body>
    <canvas id="canvas"></canvas>
</body>
</html>
```

The `cfxnes.js` can be build with `npm run lib` command.
The file is generated to the `dist/lib` directory.


## Debugger

Use `./bin/debugger` to debug NES ROM images using CFxNES.
Run the debugger with `-h` flag to see available options.
