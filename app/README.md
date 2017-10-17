# cfxnes (app)

NES emulator running in web browser.

A live demo is at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com).

## Building

Build the [cfxnes library](../lib) first.

Use `npm run build` to build the application.

## Running

Use `npm start` to start the application at [localhost:5000](http://localhost:5000)

## Development

Use `npm run dev` to start the application in development mode.

Running this command for the first time will generate `dev.config.js` configuration file that can be used to customize some development parameters.

Use `npm run lint` to run linting.

Use `npm run analyze` to record webpack statistics into `stats.json` file.

Use `npm run clean` to clean all generated files.

## Library

Add **.nes** files to the **dist/roms** directory to make them available through library inside the application.

For custom thumbnails, add picture with identical name (e.g., **game.jpg** for **game.nes**). Supported formats are JPG, PNG and GIF.
