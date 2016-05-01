//=========================================================
// Array utilities
//=========================================================

export function zeroArray(array, start, end) {
  return fillArray(array, 0, start, end);
}

// There is no IE 11 polyfill just for the TypeArray.prototype.fill method
export function fillArray(array, value, start = 0, end = array.length) {
  end = Math.min(end, array.length);
  for (var i = start; i < end; i++) {
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
