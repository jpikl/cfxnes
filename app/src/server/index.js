import path from 'path';
import express from 'express';
import historyApiFallback from 'express-history-api-fallback';
import {env, log} from './common';
import {RomDB, createRomRouter} from './roms';

const resolvePath = path.resolve.bind(path, __dirname);

const staticDir = resolvePath('static');
const romsDirName = 'roms';
const romsDir = env.development
  ? resolvePath('..', '..', '..', romsDirName)
  : resolvePath(romsDirName);

const app = express();
const romDb = new RomDB(romsDir);

if (env.development) {
  app.use(require('morgan')('dev'));
}

app.use('/', createRomRouter(romDb));
app.use('/', express.static(staticDir));
app.use(historyApiFallback('index.html', {root: staticDir}));

app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  log.error(error.stack);
  res.sendStatus(500);
});

app.listen(process.env.PORT || 5000);
romDb.start();
