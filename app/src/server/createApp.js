import express from 'express';
import compression from 'compression';
import historyApiFallback from 'express-history-api-fallback';
import {log} from '../common';
import errorHandler from './errorHandler';
import {createRomRouter} from './roms';

export default function createApp(romDb, options) {
  const {
    staticPath = false,
    morganEnabled = false,
    morganFormat = false,
  } = options;

  log.info('Creating application');
  log.info('  static path: %s', staticPath);
  log.info('  morgan enabled: %s', morganEnabled);
  log.info('  morgan format: %s', morganFormat);

  const app = express();
  app.use(compression());
  app.use(configureHeaders);

  if (morganEnabled) {
    const morgan = require('morgan');
    app.use(morgan(morganFormat));
  }

  app.use('/', createRomRouter(romDb));
  app.use('/', express.static(staticPath));
  app.use(historyApiFallback('index.html', {root: staticPath}));
  app.use(errorHandler);

  return app;
}

function configureHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('X-Powered-By');
  next();
}
