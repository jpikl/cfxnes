import path from 'path';
import express from 'express';
import historyApiFallback from 'express-history-api-fallback';
import {log, LogLevel} from '../common';
import {RomDB, createRomRouter} from './roms';

const {NODE_ENV, LOG_LEVEL, ROMS_DIR, PORT} = process.env;

const development = NODE_ENV !== 'production';
const resolvePath = path.resolve.bind(path, __dirname);

log.setLevel(LOG_LEVEL || development ? LogLevel.INFO : LogLevel.OFF);

const staticDir = resolvePath('static');
const romsDirName = 'roms';
const romsDir = ROMS_DIR || development
  ? resolvePath('..', '..', '..', romsDirName)
  : resolvePath(romsDirName);

const app = express();
const romDb = new RomDB(romsDir);

if (development) {
  app.use(require('morgan')('dev'));
}

app.use('/', createRomRouter(romDb));
app.use('/', express.static(staticDir));
app.use(historyApiFallback('index.html', {root: staticDir}));

app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  log.error(error.stack);
  res.sendStatus(500);
});

app.listen(PORT || 5000);
romDb.start();
