import createServer from '../../../src/server/createServer';
import getApp from './getApp';

let server = null;

export default function getServer() {
  if (server == null) {
    server = createServer(getApp(), {});
  }
  return server;
}

after(() => {
  if (server) {
    server.close();
  }
});
