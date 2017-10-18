import path from 'path';
import {sanitizeName} from './format';

export function getSanitizedFileName(romFile) {
  const extName = path.extname(romFile);
  const baseName = path.basename(romFile, extName);
  return sanitizeName(baseName) + extName;
}
