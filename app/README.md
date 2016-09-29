# cfxnes / app

Web application built on top of the [cfxnes library](../lib).

A live demo is running at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com)

### Building

Build the [library](../lib) first, then run `gulp build`.

### Running

`node dist/app.js` will start the application at [localhost:5000](http://localhost:5000)

### Configuration

Putting **.nes** files in the **dist/roms** directory will make them available in application.
For custom thumbnails, add picture with the same name (e.g., **game.jpg** for **game.nes**). Supported formats are JPG, PNG and GIF.

### Development

Run `gulp` to see available tasks and their options.
