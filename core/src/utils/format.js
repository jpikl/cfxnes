//=========================================================
// Formating utilities
//=========================================================

export function formatSize(size) {
  if (typeof size !== 'number') {
    return undefined;
  }
  if (Math.abs(size) >= 1024 * 1024) {
    return ~~(size / (1024 * 1024)) + ' MB';
  }
  if (Math.abs(size) >= 1024) {
    return ~~(size / 1024) + ' KB';
  }
  return size + ' B';
}
