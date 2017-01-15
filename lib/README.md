# cfxnes / lib

JavaScript library for NES emulation in web browser.

- [API](API.md)
- [Examples](examples)

### Supported Browsers

- Chrome 49+
- Firefox 47+
- IE 11, Edge 12+
- Opera 38+
- Safari 9+

IE 11, Edge 12 and Safari 9 need polyfill for some ES6 features ([core-js shim](https://github.com/zloirock/core-js) is recommended).

### Example

``` html
<!DOCTYPE html>
<html>
<head>
  <script src="cfxnes.js"></script>
</head>
<body>
  <canvas id="cfxnes"></canvas> <!-- Used for rendering -->
  <script>
    cfxnes({rom: 'game.nes'}); // URL of a ROM image to load
  </script>
</body>
</html>
```

### Importing

``` javascript
// AMD
define(['cfxnes'], function(cfxnes) {/* ... */});

// CommonJS
const cfxnes = require('cfxnes');

// Global variable
window.cfxnes;
```

### Building

Run `npm run build` to build the library.
