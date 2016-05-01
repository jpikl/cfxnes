//=========================================================
// Formating utilities
//=========================================================

export function numberAsHex(value) {
  return value.toString(16).toUpperCase();
}

export function byteAsHex(value) {
  var hex = numberAsHex(value);
  return (hex.length === 1) ? '0' + hex : hex;
}

export function wordAsHex(value) {
  var hex1 = byteAsHex(value & 0xFF);
  var hex2 = byteAsHex(value >>> 8);
  return hex2 + hex1;
}

export function fillLeft(value, width, character = ' ') {
  var result = Array(width + 1).join(character) + value;
  return result.slice(result.length - width);
}

export function capitalize(sentence) {
  return sentence.split(' ')
        .map(word => word.length ? word[0].toUpperCase() + word.slice(1) : word)
        .join(' ');
}

export function formatOpt(value) {
  return value != null ? value : '???';
}

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

export function formatData(data) {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  return String.fromCharCode.apply(null, data);
}

export function formatError(error) {
  var result = 'Name:    ' + error.name + '\n'
             + 'Message: ' + error.message;
  if (typeof error.stack === 'string') {
    result += '\nStack:   ' + error.stack.split('\n')
                                         .map(line => '         ' + line)
                                         .join('\n')
                                         .substr(9);
  }
  return result;
}
