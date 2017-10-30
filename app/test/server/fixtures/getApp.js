import createApp from '../../../src/server/createApp';
import getRomDb from './getRomDb';
import {STATIC_PATH} from './paths';

let app = null;

export default function getApp() {
  if (app == null) {
    app = createApp(getRomDb(), {staticPath: STATIC_PATH});
  }
  return app;
}
