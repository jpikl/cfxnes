import path from 'path';
import {sanitizeName} from './format';

export function getSanitizedFileName(file) {
  const extName = path.extname(file);
  const baseName = path.basename(file, extName);
  return sanitizeName(baseName) + extName;
}
