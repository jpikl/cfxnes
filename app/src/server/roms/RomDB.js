import fs from 'fs';
import path from 'path';
import {debounce, log, getSanitizedFileName} from '../common';
import {ROMS_FILES_PATH} from '../routes';
import {isRomFile, getRomId, getRomName, compareRomsByName, findRomThumbFile} from './utils';

export default class RomDB {

  constructor(romsDir) {
    this.romsDir = romsDir;
    this.roms = [];
    this.romMap = {};
    this.fileMap = {};
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
    const {romsDir} = this;
    if (!fs.existsSync(romsDir)) {
      fs.mkdirSync(romsDir);
    }
    fs.watch(romsDir, debounce(() => this.reload(), 1000));
    this.reload();
  }

  reload() {
    const {romsDir} = this;
    log.info(`Scanning "${romsDir}" directory`);

    const roms = [];
    const romMap = {};
    const fileMap = {};

    for (const romFileName of fs.readdirSync(romsDir)) {
      if (!isRomFile(romFileName)) {
        continue;
      }

      const romFile = path.join(romsDir, romFileName);
      const publicRomFileName = getSanitizedFileName(romFileName);
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
        const publicThumbFileName = getSanitizedFileName(thumbFile);
        fileMap[publicThumbFileName] = thumbFile;
        rom.thumbnail = `${ROMS_FILES_PATH}/${publicThumbFileName}`;
      }
    }

    roms.sort(compareRomsByName);

    this.roms = roms;
    this.romMap = romMap;
    this.fileMap = fileMap;

    log.info(`Found ${roms.length} ROMs`);
  }

}
