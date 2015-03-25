//=========================================================
// System utilities
//=========================================================

export const LITTLE_ENDIAN = detectEndianness() === "LE";
export const BIG_ENDIAN    = detectEndianness() === "BE";

export function detectEndianness() {
    var buffer = new ArrayBuffer(4);
    var u32 = new Uint32Array(buffer);
    var u8 = new Uint8Array(buffer);
    u32[0] = 0xFF;
    return (u8[0] === 0xFF) ? "LE" : "BE";
}

export function newByteArray(size) {
    return new Uint8ClampedArray(size);
}

export function newUintArray(size) {
    // For some strange reason, Uint32Array is much slower
    // than ordinary array in Chrome.
    var data = new Array(size);
    clearArray(data);
    return data;
}

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
