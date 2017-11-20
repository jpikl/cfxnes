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
    trustProxy = false,
    httpsRedirect = false,
  } = options;

  log.info('Creating application');
  log.info('  static path: %s', staticPath);
  log.info('  morgan enabled: %s', morganEnabled);
  log.info('  morgan format: %s', morganFormat);
  log.info('  trust proxy: %s', trustProxy);
  log.info('  https redirect: %s', httpsRedirect);

  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.use(compression());
  app.use(setHeaders);

  if (httpsRedirect) {
    app.use(doHttpsRedirect);
  }

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

function setHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}

function doHttpsRedirect(req, res, next) {
  if (!req.secure) {
    res.redirect('https://' + req.hostname + req.originalUrl);
  } else {
    next();
  }
}
