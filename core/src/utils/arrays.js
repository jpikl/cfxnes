//=========================================================
// Array utilities
//=========================================================

export function clearArray(array, start, end) {
  return fillArray(array, 0, start, end);
}

export function fillArray(array, value, start = 0, end = array.length) {
  start = Math.max(0, start);
  end = Math.min(end, array.length);
  for (var i = start; i < end; i++) {
    array[i] = value;
  }
  return array;
}

export function copyArray(source, target) {
  if (target == null) {
    target = new Array(source.length);
  }
  var length = Math.min(source.length, target.length);
  for (var i = 0; i < length; i++) {
    target[i] = source[i];
  }
  return target;
}

export function arrayToProperties(array, callback, thisArg) {
  var object = {};
  for (var value of array) {
    object[value] = callback.call(thisArg, value);
  }
  return object;
}
