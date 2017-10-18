# cfxnes (app)

NES emulator running in web browser.

A live demo is at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com).

## Building

Build the [cfxnes library](../lib) first.

Use `npm run build` to build the whole application.

Use `npm run build:client` to build only the client.

Use `npm run build:server` to build only the server.

## Running

Use `npm start` to start the application at [localhost:5000](http://localhost:5000)

## Development

Use `npm run dev` to build and start the whole application in development mode.

Use `npm run dev:server` to build client in development mode.

Running one of these command for the first time will generate `webpack.dev.js` configuration file that can be used to customize some webpack development parameters.

Use `npm run dev:server` to build and start server in development mode.

Use `npm run lint` to run linting.

Use `npm run analyze` to record webpack statistics into `stats.json` file.

Use `npm run clean` to clean all generated files.

## Testing

Use `npm test` to run all tests.

## Library

Add **.nes** files to the **dist/roms** directory to make them available through library inside the application.

For custom thumbnails, add picture with identical name (e.g., **game.jpg** for **game.nes**). Supported formats are JPG, PNG and GIF.
