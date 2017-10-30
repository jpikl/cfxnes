import fs from 'fs';
import path from 'path';
import {debounce, log} from '../../common';
import {ROMS_FILES_PATH} from '../routes';
import {isRomFile, getRomId, getRomName, compareRomsByName, findRomThumbFile, getPublicFileName} from './utils';

export default class RomDb {

  constructor(romsDir, options = {}) {
    const {reloadDelay = 1000} = options;

    log.info('Creating ROM database');
    log.info('  directory: %s', romsDir);
    log.info('  reload delay: %d', reloadDelay);

    this.romsDir = romsDir;
    this.roms = [];
    this.romMap = {};
    this.fileMap = {};
    this.delayedReload = debounce(() => this.reload(), reloadDelay);
    this.reloadsCount = 0;
  }

  getRoms() {
    return this.roms;
  }

  getRom(id) {
    return this.romMap[id];
  }

  getFile(fileName) {
    return this.fileMap[fileName];
  }

  start() {
    if (this.watcher) {
      return;
    }
    const {romsDir} = this;
    if (!fs.existsSync(romsDir)) {
      log.info('Creating "%s" directory', romsDir);
      fs.mkdirSync(romsDir);
    }
    this.watcher = fs.watch(romsDir, this.delayedReload);
    this.reload();
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  reload() {
    const {romsDir} = this;
    this.reloadsCount++;
    log.info('Reloading "%s" directory (#%d)', romsDir, this.reloadsCount);

    const roms = [];
    const romMap = {};
    const fileMap = {};

    for (const romFileName of fs.readdirSync(romsDir)) {
      if (!isRomFile(romFileName)) {
        continue;
      }

      const romFile = path.resolve(romsDir, romFileName);
      const publicRomFileName = getPublicFileName(romFileName);
      fileMap[publicRomFileName] = romFile;

      const rom = {
        id: getRomId(romFileName),
        name: getRomName(romFileName),
        file: `${ROMS_FILES_PATH}/${publicRomFileName}`,
      };

      roms.push(rom);
      romMap[rom.id] = rom;

      const thumbFile = findRomThumbFile(romFile);
      if (thumbFile) {
        const publicThumbFileName = getPublicFileName(thumbFile);
        fileMap[publicThumbFileName] = thumbFile;
        rom.thumbnail = `${ROMS_FILES_PATH}/${publicThumbFileName}`;
      }
    }

    roms.sort(compareRomsByName);

    this.roms = roms;
    this.romMap = romMap;
    this.fileMap = fileMap;

    log.info('Found %d ROMs', roms.length);
  }

}
