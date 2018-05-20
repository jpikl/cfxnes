# cfxnes (app)

NES emulator running in web browser.

A live demo is at [cfxnes.herokuapp.com](http://cfxnes.herokuapp.com).

## Building and Running

Build the [cfxnes library](../lib) first.

Run `npm run build` to build the application into the **dist** directory.

Run `npm start` to start the application at [localhost:5000](http://localhost:5000).

## Configuration

Configuration is loaded from the **config.json** file.

Configuration options can be also passed through environment variables (`fooBar` configuration option corresponds to `FOO_BAR` environment variable).

Default values are documented in [defaults.js](src/server/config/defaults.js).

## Library

When the application is started for the first time, it creates **roms** directory.
Add **.nes** files to this directory to make them available on the library page.

For custom thumbnails, add picture with identical name (e.g., **game.jpg** for **game.nes**). Supported formats are JPG, PNG and GIF.

## Development

| `npm run <script>` | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `dev`              | Build and start application in development mode.              |
| `dev:server`       | Build and start server in development mode.                   |
| `dev:client`       | Build and start client in development mode.                   |
| `build`            | Build application.                                            |
| `build:server`     | Build server.                                                 |
| `build:client`     | Build client.                                                 |
| `analyze`          | Record webpack statistics into `stats.json` file.             |
| `start`            | Start application at [localhost:5000](http://localhost:5000). |
| `lint`             | Run linter.                                                   |
| `lint:js`          | Run linter (JS only).                                         |
| `lint:css`         | Run linter (CSS only).                                        |
| `test`             | Run all tests.                                                |
| `clean`            | Clean all generated files.                                    |

Running one of the `dev*` scripts for the first time will generate `webpack.dev.js` configuration file that can be used to customize some webpack development parameters.

## Troubleshooting

### Emulation does not work when running app using `npm run dev`

This seems to be a Chrome issue. There are two workarounds:

1. Build the [cfxnes library](../lib) first. Then run `npm run dev`.
2. Comment `this.vblankSuppressed = false;` line in `PPU` constructor in `PPU.js`.
