import path from 'path';
import express from 'express';
import historyApiFallback from 'express-history-api-fallback';
import {log, LogLevel} from '../common';
import {RomDB, createRomRouter} from './roms';

const {LOG_LEVEL, MORGAN_FORMAT, ROMS_DIR, PORT} = process.env;

log.setLevel(LOG_LEVEL || LogLevel.OFF);

const resolvePath = path.resolve.bind(path, __dirname);
const staticDir = resolvePath('static');
const romsDir = ROMS_DIR ? path.resolve(ROMS_DIR) : resolvePath('roms');

const app = express();
const romDb = new RomDB(romsDir);

if (MORGAN_FORMAT) {
  app.use(require('morgan')(MORGAN_FORMAT));
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
