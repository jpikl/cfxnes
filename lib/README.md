# CFxNES Library

JavaScript library for NES emulation in web browser.

``` javascript
var cfxnes = new CFxNES({videoOutput: canvas});
cfxnes.downloadCartridge('game.nes').then(() => cfxnes.start());
```

## Requirements

The library requires browser with [Promise](https://promisesaplus.com/) support.
You can use [polyfill](https://www.promisejs.org/polyfills/promise-7.0.4.min.js)
to make it working in Internet Explorer, Firefox (< 29) and Chrome (< 32).

## API

See [API documentation](docs/api.md).

## Example

A minimal example that will download and execute ROM image. 

``` html
<!DOCTYPE html>
<html>
<head>
    <title>CFxNES Example</title>
    <script src="http://www.promisejs.org/polyfills/promise-7.0.4.min.js"></script>
    <script src="http://cfxnes.herokuapp.com/cfxnes.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
        // Canvas element used for rendering
        var canvas = document.getElementById("canvas");
        // Initialization
        var cfxnes = new CFxNES({videoOuput: canvas});
        // Download ROM image from relative URL
        cfxnes.downloadCartridge("roms/game.nes").then(function() {
            cfxnes.start(); // Success, start the emulator
        }).catch(function(error) {
            alert(error); // Something wen wrong, handle error
        });
    </script>
</body>
</html>
```

## Building

1) [Set up your development environment](../docs/dev-environment.md).

2) Build optimized and minified version of the library `dist/cfxnes.js`:

    gulp build

3) Or build debug version of the library `dist/cfxnes.debug.js`:

    gulp build -d
