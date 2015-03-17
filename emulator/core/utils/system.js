//=========================================================
// System utilities
//=========================================================

var system = {

    // Alias for CommonJS require.
    // Useful when requiring module outside Closure Compiler resolution.
    require(module) {
        if (typeof require !== "function") {
            throw new Error("CommonJS require not avaialable.");
        }
        return require(module);
    },

    detectEndianness () {
        var buffer = new ArrayBuffer(4);
        var u32 = new Uint32Array(buffer);
        var u8 = new Uint8Array(buffer);
        u32[0] = 0xFF;
        return (u8[0] === 0xFF) ? "LE" : "BE";
    },

    newUint8Array(size) {
        return new Uint8ClampedArray(size);
    },

    newUint32Array(size) {
        // For some strange reason, Uint32Array is much slower
        // than ordinary array in Chrome.
        data = new Array(size);
        system.clearArray(data);
        return data;
    },

    clearArray(array, value = 0) {
        for (var i = 0; i < array.length; i++) {
            array[i] = value;
        }
    }

};

system.littleEndian = system.detectEndianness() === "LE";
system.bigEndian    = system.detectEndianness() === "BE";

module.exports = system;
