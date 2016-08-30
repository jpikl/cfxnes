# cfxnes / lib

JavaScript library for NES emulation in web browser.

## Documentation

See [docs](docs/api.md) for API documentation.

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

## Building

Run `gulp build` to build the library.

## Development

Run `gulp` to see available task and their options.
