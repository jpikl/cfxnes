import http from 'http';
import https from 'https';
import {expect} from 'chai';
import createServer from '../../src/server/createServer';
import {TLS_KEY_PATH, TLS_CERT_PATH, getApp} from './fixtures';

describe('server/createServer', () => {
  it('creates HTTP server', () => {
    const server = createServer(getApp(), {});
    expect(server).to.be.instanceOf(http.Server);
  });

  it('creates HTTPS server', () => {
    const server = createServer(getApp(), {
      tlsEnabled: true,
      tlsKeyPath: TLS_KEY_PATH,
      tlsCertPath: TLS_CERT_PATH,
    });
    expect(server).to.be.instanceOf(https.Server);
  });
});
