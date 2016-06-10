//=========================================================
// Array utilities
//=========================================================

export function createArray(size, value = 0) {
  return fillArray(new Array(size), value);
}

export function zeroArray(array, start, end) {
  return fillArray(array, 0, start, end);
}

// There is no IE 11 polyfill for the TypeArray.prototype.fill method, so we use this function instead
export function fillArray(array, value, start = 0, end = array.length) {
  end = Math.min(end, array.length);
  for (let i = start; i < end; i++) {
    array[i] = value;
  }
  return array;
}
