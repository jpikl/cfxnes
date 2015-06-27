//=========================================================
// Formating utilities
//=========================================================

export function numberAsHex(value) {
    return value.toString(16).toUpperCase();
}

export function byteAsHex(value) {
    var hex = numberAsHex(value);
    return (hex.length === 1) ? "0" + hex : hex;
}

export function wordAsHex(value) {
    var hex1 = byteAsHex(value & 0xFF);
    var hex2 = byteAsHex(value >>> 8);
    return hex2 + hex1;
}

export function fillLeft(value, width, character = " ") {
    var result = Array(width + 1).join(character) + value;
    return result.slice(result.length - width);
}

export function fillRight(value, width, character = " ") {
    var result = value + Array(width + 1).join(character);
    return result.slice(0, width);
}

export function capitalize(value) {
    var words = value.split(" ");
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].slice(0, 1).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}

export function readableSize(size) {
    if (typeof size !== "number") {
        return "???";
    }
    if (size >= 1024 * 1024) {
        return ~~(size / (1024 * 1024)) + " MB";
    }
    if (size >= 1024) {
        return ~~(size / 1024) + " KB";
    }
    return size + " B";
}

export function readableBytes(bytes) {
    if (!bytes) {
        return "???";
    }
    return String.fromCharCode.apply(null, bytes);
}
