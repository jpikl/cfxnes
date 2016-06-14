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

export function formatError(error) {
  let result = 'Name:    ' + error.name
           + '\nMessage: ' + error.message;
  if (typeof error.stack === 'string') {
    result += '\nStack:   ' + error.stack.split('\n')
                             .map(line => '         ' + line)
                             .join('\n')
                             .substr(9);
  }
  return result;
}
