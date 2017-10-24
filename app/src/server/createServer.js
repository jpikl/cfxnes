import fs from 'fs';
import {log} from '../common';

export default function createServer(app, config) {
  const {http2Enabled, tlsEnabled, tlsKeyPath, tlsCertPath} = config;

  const options = {
    key: tlsEnabled ? fs.readFileSync(tlsKeyPath) : undefined,
    cert: tlsEnabled ? fs.readFileSync(tlsCertPath) : undefined,
  };

  if (http2Enabled) {
    const http2 = require('http2'); // eslint-disable-line import/no-extraneous-dependencies

    if (tlsEnabled) {
      log.info('Creating secure HTTP2');
      return http2.createSecureServer(options, app);
    }

    log.info('Creating HTTP2 server');
    return http2.createServer(app);
  }

  if (tlsEnabled) {
    log.info('Creating HTTPS server');
    return require('https').createServer(options, app);
  }

  log.info('Creating HTTP server');
  return require('http').createServer(app);
}
