# CFxNES Library

JavaScript Library for NES emulation in web browser.

*Note: The library API is currently unstable and undocumented.*

## Requirements

The library requires browser that supports [Promises](https://promisesaplus.com/).
You can use [polyfill](https://www.promisejs.org/polyfills/promise-7.0.4.min.js)
to make it working in Internet Explorer, Firefox (< 29) and Chrome (< 32).

## Minimal Example

The following code will download and execute `game.nes` ROM image. 
The video output will be rendered to the canvas element.

``` html
<!DOCTYPE html>
<html>
<head>
    <title>CFxNES Minimal Example</title>
    <script src="//www.promisejs.org/polyfills/promise-7.0.4.min.js"></script>
    <script src="cfxnes.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
        var cfxnes = new CFxNES;
        cfxnes.setVideoOutput(document.getElementById("canvas"));
        cfxnes.downloadCartridge("game.nes").then(function() {
            cfxnes.start(); // Success, run the emulator
        }).catch(function(error) {
            alert(error);
        });
    </script>
</body>
</html>
```

## Building

Install dependencies:

    npm install

Build optimized and minified version of the library `dist/cfxnes.js`:
    
    gulp build

Build debug version of the library `dist/cfxnes.debug.js`:

    gulp build -d

## Tests

Run tests:

    gulp test
