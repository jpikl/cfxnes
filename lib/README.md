# CFxNES Lib

JavaScript library for NES emulation in web browser.

``` javascript
const cfxnes = new CFxNES({videoOutput: canvas});
cfxnes.loadROM(source).then(() => cfxnes.start());
```

## Browser Compatibility

In order to support IE 11, some polyfills are required:
- [Promise](https://www.npmjs.com/package/promise-polyfill)
- [Object.assign](https://www.npmjs.com/package/object-assign-polyfill)

## API

See [API documentation](docs/api.md).

## Example

**Note: This example is for the upcoming version 0.5.0**

A minimal example that will download and execute ROM image:

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
        const canvas = document.getElementById('canvas'); // Canvas used for rendering
        const cfxnes = new CFxNES({videoOuput: canvas});  // Initialization
        cfxnes.loadROM('rom.nes')       // Download ROM image from relative URL
            .then(() => cfxnes.start()) // Success, start the emulator
            .catch(alert);              // Something went wrong
    </script>
</body>
</html>
```

## Building

Optimized minified version `dist/cfxnes.js`:

    gulp build

Debug version `dist/cfxnes.debug.js`:

    gulp build -d
