import fs from 'fs';
import path from 'path';
import {createId, sanitizeName, removePrefix} from '../common';

const romExtName = '.nes';
const thumbExtNames = ['.png', '.git', '.jpg', '.jpeg'];

export function isRomFile(file) {
  return path.extname(file).toLowerCase() === romExtName;
}

export function getRomId(romFile) {
  const extName = path.extname(romFile);
  const baseName = path.basename(romFile, extName);
  return createId(baseName);
}

export function getRomName(romFile) {
  const extName = path.extname(romFile);
  return path.basename(romFile, extName).trim();
}

export function compareRomsByName(rom1, rom2) {
  const name1 = removePrefix(rom1.name, 'the ', true);
  const name2 = removePrefix(rom2.name, 'the ', true);
  return name1.localeCompare(name2);
}

export function findRomThumbFile(romFile) {
  const dirName = path.dirname(romFile);
  const extName = path.extname(romFile);
  const baseName = path.basename(romFile, extName);

  for (const thumbExtName of thumbExtNames) {
    const thumbFileName = baseName + thumbExtName;
    const thumbFile = path.join(dirName, thumbFileName);

    if (fs.existsSync(thumbFile)) {
      return thumbFile;
    }
  }

  return null;
}

export function getPublicFileName(file) {
  const extName = path.extname(file);
  const baseName = path.basename(file, extName);
  return sanitizeName(baseName) + extName.toLowerCase();
}
