//=========================================================
// Array utilities
//=========================================================

export function clearArray(array, start = 0, end = array.length) {
  fillArray(array, 0, start, end);
}

export function fillArray(array, value, start = 0, end = array.length) {
  var start = Math.max(0, start);
  var end = Math.min(end, array.length);
  for (var i = start; i < end; i++) {
    array[i] = value;
  }
}

export function copyArray(source, target) {
  var length = Math.min(source.length, target.length);
  for (var i = 0; i < length; i++) {
    target[i] = source[i];
  }
}

export function arrayToProperties(array, callback, thisArg) {
  var object = {};
  for (var value of array) {
    object[value] = callback.call(thisArg, value);
  }
  return object;
}
