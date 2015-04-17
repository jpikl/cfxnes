import { clearArray } from "./arrays"

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
