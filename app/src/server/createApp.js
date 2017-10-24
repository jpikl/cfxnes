import express from 'express';
import historyApiFallback from 'express-history-api-fallback';
import {log} from '../common';
import {createRomRouter} from './roms';

export default function createApp(romDb, config) {
  const {staticPath, morganEnabled, morganFormat} = config;

  log.info('Creating app');
  const app = express();

  if (morganEnabled) {
    const morgan = require('morgan');
    app.use(morgan(morganFormat));
  }

  app.use('/', createRomRouter(romDb));
  app.use('/', express.static(staticPath));
  app.use(historyApiFallback('index.html', {root: staticPath}));

  app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
    log.error(error.stack);
    res.sendStatus(500);
  });

  return app;
}
