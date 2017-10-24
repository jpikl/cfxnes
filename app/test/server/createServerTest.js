import path from 'path';
import http from 'http';
import https from 'https';
import {expect} from 'chai';
import createServer from '../../src/server/createServer';

describe('server/createServer', () => {
  const app = () => {};

  it('creates HTTP server', () => {
    const server = createServer(app, {});
    expect(server).to.be.instanceof(http.Server);
  });

  it('creates HTTPS server', () => {
    const server = createServer(app, {
      tlsEnabled: true,
      tlsKeyPath: path.resolve(__dirname, 'key.pem'),
      tlsCertPath: path.resolve(__dirname, 'cert.pem'),
    });
    expect(server).to.be.instanceof(https.Server);
  });
});
