import fs from 'fs';
import {log} from '../common';

export default function createServer(app, options) {
  const {
    http2Enabled = false,
    tlsEnabled = false,
    tlsKeyPath,
    tlsCertPath,
  } = options;

  log.info('Creating server');
  log.info('  HTTP2 enabled: %s', http2Enabled);
  log.info('  TLS enabled: %s', tlsEnabled);
  log.info('  TLS key path: %s', tlsKeyPath);
  log.info('  TLS certificate path: %s', tlsCertPath);

  const tlsOptions = {
    key: tlsEnabled ? fs.readFileSync(tlsKeyPath) : undefined,
    cert: tlsEnabled ? fs.readFileSync(tlsCertPath) : undefined,
  };

  if (http2Enabled) {
    const http2 = require('http2'); // eslint-disable-line import/no-extraneous-dependencies

    if (tlsEnabled) {
      log.info('Creating secure HTTP2');
      return http2.createSecureServer(tlsOptions, app);
    }

    log.info('Creating HTTP2 server');
    return http2.createServer(app);
  }

  if (tlsEnabled) {
    log.info('Creating HTTPS server');
    return require('https').createServer(tlsOptions, app);
  }

  log.info('Creating HTTP server');
  return require('http').createServer(app);
}
