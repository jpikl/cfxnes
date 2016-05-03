# CFxNES Library

JavaScript library for NES emulation in web browser.

``` javascript
var cfxnes = new CFxNES({videoOutput: canvas});
cfxnes.loadROM('rom.nes').then(() => cfxnes.start());
```

## Browser Compatibility

In order to support IE 11, some polyfills are required:
- [Promise](https://www.npmjs.com/package/promise-polyfill)
- [Object.assign](https://www.npmjs.com/package/object-assign-polyfill)

## API

See [API documentation](docs/api.md).

## Example

A minimal example that will download and execute ROM image. 

**Note: This example is for the upcoming version 0.5.0**

``` html
<!DOCTYPE html>
<html>
<head>
    <title>CFxNES Example</title>
    <script src="http://cfxnes.herokuapp.com/cfxnes.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
        // Canvas element used for rendering
        var canvas = document.getElementById('canvas');
        // Initialization
        var cfxnes = new CFxNES({videoOuput: canvas});
        // Download ROM image from the relative URL
        cfxnes.loadROM('rom.nes').then(function() {
            cfxnes.start(); // Success, start the emulator
        }).catch(function(error) {
            alert(error); // Something went wrong
        });
    </script>
</body>
</html>
```

## Building

Optimized and minified version `dist/cfxnes.js`:

    gulp build

Debug version `dist/cfxnes.debug.js`:

    gulp build -d
