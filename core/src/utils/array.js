//=========================================================
// Array utilities
//=========================================================

export function makeArray(size, value = 0) {
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

export function copyArray(src, dst, srcPos = 0, dstPos = 0, length = src.length) {
  if (dst == null) {
    dst = new Array(src.length);
  }
  const end = Math.min(Math.min(src.length - srcPos, dst.length - dstPos), length);
  for (let i = 0; i < end; i++) {
    dst[dstPos + i] = src[srcPos + i];
  }
  return dst;
}
