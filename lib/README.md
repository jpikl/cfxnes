# cfxnes / lib

JavaScript library for NES emulation in web browser.

## Documentation

See [cfxnes API](api.md).

#### Minimal Example

Note: This example is for the upcoming version 0.5.0

``` html
<!DOCTYPE html>
<html>
<head>
  <script src="cfxnes.js"></script>
</head>
<body>
  <canvas id="cfxnes"></canvas> <!-- Used for rendering -->
  <script>
    cfxnes({rom: 'game.nes'}); // Relative URL of a ROM image to load
  </script>
</body>
</html>
```

#### Supported Browsers

- Chrome 49+
- Firefox 47+
- IE 11, Edge 12+
- Opera 38+
- Safari 9+

IE 11, Edge 12 and Safari 9 need polyfill for some ES6 feautues ([core-js shim](https://github.com/zloirock/core-js) recommended).

## Building

Run `gulp build` to build the library.

## Development

Run `gulp` to see available task and their options.
