# cfxnes (lib)

JavaScript library for NES emulation in web browser.

- [API](API.md)
- [Examples](examples)

## Supported Browsers

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Opera (last 2 versions)
- IE 11, Edge >= 12
- Safari >= 9

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
// CommonJS
const cfxnes = require('cfxnes');

// AMD
define(['cfxnes'], function(cfxnes) {/* ... */});

// Global variable
window.cfxnes;
```

## Building

Run `npm run build` to build the library into the `dist` directory.

## Development

| `npm run <script>` | Description                                  |
| ------------------ | -------------------------------------------- |
| `dev`              | Build library in watch mode.                 |
| `dev:debug`        | Build library (debug version) in watch mode. |
| `build`            | Build library.                               |
| `build:debug`      | Build library (debug version).               |
| `lint`             | Run linter.                                  |
| `test`             | Run all tests.                               |
| `test:src`         | Run tests for source modules.                |
| `test:lib`         | Run tests for built library.                 |
| `test:lib:debug`   | Run tests for built library (debug version). |
| `clean`            | Clean all generated files.                   |

Running one of the `test*` scripts for the first time will generate `karma.browser.js` configuration file that can be used to customize which browsers are used to run tests.
