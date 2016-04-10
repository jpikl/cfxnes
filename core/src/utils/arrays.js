//=========================================================
// Array utilities
//=========================================================

export function zeroArray(array, position, length) {
  return fillArray(array, 0, position, length);
}

export function fillArray(array, value, position = 0, length = array.length) {
  var end = Math.min(position + length, array.length);
  for (var i = position; i < end; i++) {
    array[i] = value;
  }
  return array;
}

export function copyArray(src, dst, srcPos = 0, dstPos = 0, length = src.length) {
  if (dst == null) {
    dst = new Array(src.length);
  }
  var end = Math.min(Math.min(src.length - srcPos, dst.length - dstPos), length);
  for (var i = 0; i < end; i++) {
    dst[dstPos + i] = src[srcPos + i];
  }
  return dst;
}

export function arrayToProperties(array, callback, thisArg) {
  var object = {};
  for (var value of array) {
    object[value] = callback.call(thisArg, value);
  }
  return object;
}
