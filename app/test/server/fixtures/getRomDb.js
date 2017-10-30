import {RomDb} from '../../../src/server/roms';
import {ROMS_PATH} from './paths';

let romDb = null;

export default function getRomDb() {
  if (romDb == null) {
    romDb = new RomDb(ROMS_PATH);
    romDb.start();
  }
  return romDb;
}

after(() => {
  if (romDb) {
    romDb.stop();
  }
});
