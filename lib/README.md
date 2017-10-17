# cfxnes (lib)

JavaScript library for NES emulation in web browser.

- [API](API.md)
- [Examples](examples)

## Supported Browsers

- Chrome 49+
- Firefox 47+
- IE 11, Edge 12+
- Opera 38+
- Safari 9+

IE 11 and Safari 9 need [polyfill for some ES6 features](polyfills.js).

## Example

``` html
<!DOCTYPE html>
<html>
<head>
  <script src="cfxnes.js"></script>
</head>
<body>
  <canvas id="cfxnes"></canvas> <!-- Rendering target -->
  <script>
    cfxnes({rom: 'game.nes'}); // URL of a ROM image to load
  </script>
</body>
</html>
```

## Importing

``` javascript
// AMD
define(['cfxnes'], function(cfxnes) {/* ... */});

// CommonJS
const cfxnes = require('cfxnes');

// Global variable
window.cfxnes;
```

## Building

Use `npm run build` to build the library.

Use `npm run build:debug` to build the library (debug version).

## Development

Use `npm run dev` to build the library in watch mode.

Use `npm run dev:debug` to build the library (debug version) in watch mode.

Use `npm run lint` to run linting.

Use `npm run clean` to clean all generated files.

## Testing

Use `npm test` to run all tests.

Use `npm run test:src` to run tests for source modules.

Use `npm run test:lib` to run tests for built library.

Use `npm run test:lib:debug` to run tests for built library (debug version).

Running these commands for the first time will generate `karma.browser.js` configuration file that can be used to customize which browsers are used to run tests.
