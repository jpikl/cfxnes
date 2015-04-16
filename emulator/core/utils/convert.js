//=========================================================
// Conversion utilities
//=========================================================

export var md5 = typeof window !== "undefined" && window.md5 || require("js-md5");

export function dataToString(input) {
    return String.fromCharCode.apply(null, input);
}

export function stringToData(input, output) {
    if (output == null) {
        output = new Uint8Array(input.length);
    }
    for (var i = 0; i < input.length; i++) {
        output[i] = input.charCodeAt(i);
    }
    return output;
}

export function objectToString(input) {
    return JSON.stringify(input);
}

export function stringToObject(input) {
    return JSON.parse(input);
}

export function roundUpToPowerOf2(number) {
    var result = 1;
    while (result < number) {
        result *= 2;
    }
    return result;
}
