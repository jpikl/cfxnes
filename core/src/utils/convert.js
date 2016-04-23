import {copyArray, copyCharCodes} from './arrays';

//=========================================================
// Conversion utilities
//=========================================================

export function objectToString(input) {
  return JSON.stringify(input);
}

export function stringToObject(input) {
  return JSON.parse(input);
}

export function dataToString(input) {
  return String.fromCharCode.apply(null, input);
}

export function stringToData(input, output) {
  if (output == null) {
    output = new Uint8Array(input.length);
  }
  var length = Math.min(input.length, output.length);
  for (var i = 0; i < length; i++) {
    output[i] = input.charCodeAt(i);
  }
  return output;
}

export function dataToBase64(input) {
  return encodeBase64(dataToString(input));
}

export function base64ToData(input, output) {
  return stringToData(decodeBase64(input), output);
}

export function encodeBase64(input) {
  if (typeof btoa === 'function') {
    return btoa(input);
  } else if (typeof Buffer === 'function') {
    return new Buffer(input, 'binary').toString('base64');
  }
  throw new Error('Unsupported operation: encodeBase64');
}

export function decodeBase64(input) {
  if (typeof atob === 'function') {
    return atob(input);
  } else if (typeof Buffer === 'function') {
    return new Buffer(input, 'base64').toString('binary');
  }
  throw new Error('Unsupported operation: decodeBase64');
}
