# CFxNES Library

JavaScript library for NES emulation in web browser.

## Requirements

The library requires browser with [Promise](https://promisesaplus.com/) support.
You can use [polyfill](https://www.promisejs.org/polyfills/promise-7.0.4.min.js)
to make it working in Internet Explorer, Firefox (< 29) and Chrome (< 32).

## API

See [API documentation](docs/api.md).

## Example

This example will download and execute `game.nes` ROM image. 
The video output will be rendered to the canvas element.

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
        var canvas = document.getElementById("canvas");
        var cfxnes = new CFxNES({videoOuput: canvas});
        cfxnes.downloadCartridge("game.nes").then(function() {
            cfxnes.start(); // Success, start the emulator
        }).catch(function(error) {
            alert(error); // Something went wrong
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
