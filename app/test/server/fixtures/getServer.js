import http from 'http';
import getApp from './getApp';

let server = null;

export default function getServer() {
  if (server == null) {
    server = http.createServer(getApp());
  }
  return server;
}

after(() => {
  if (server) {
    server.close();
  }
});
