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

export function newUint8Array(size) {
    return new Uint8ClampedArray(size);
}

export function newUint32Array(size) {
    // For some strange reason, Uint32Array is much slower
    // than ordinary array in Chrome.
    var data = new Array(size);
    clearArray(data);
    return data;
}

export function clearArray(array, value = 0) {
    for (var i = 0; i < array.length; i++) {
        array[i] = value;
    }
}

export function copyArray(source, target) {
    var length = Math.min(source.length, target.length);
    for (var i = 0; i < length; i++) {
        target[i] = source[i];
    }
}
