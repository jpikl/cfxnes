var format;

format = {
  numberAsHex: function(value) {
    return (value.toString(16)).toUpperCase();
  },
  byteAsHex: function(value) {
    var hex;
    hex = format.numberAsHex(value);
    if (hex.length === 1) {
      return "0" + hex;
    } else {
      return hex;
    }
  },
  wordAsHex: function(value) {
    var hex1, hex2;
    hex1 = format.byteAsHex(value & 0xFF);
    hex2 = format.byteAsHex(value >>> 8);
    return hex2 + hex1;
  },
  fillLeft: function(value, width, character) {
    var result;
    if (character == null) {
      character = " ";
    }
    result = (Array(width + 1).join(character)) + value;
    return result.slice(result.length - width);
  },
  fillRight: function(value, width, character) {
    var result;
    if (character == null) {
      character = " ";
    }
    result = value + (Array(width + 1).join(" "));
    return result.slice(0, width);
  },
  capitalize: function(value) {
    var words;
    words = value.split(' ');
    words = words.map(function(word) {
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    });
    return words.join(' ');
  },
  readableSize: function(size) {
    if (typeof size !== "number") {
      return "???";
    }
    if (size >= 1024 * 1024) {
      return (size / (1024 * 1024)) + " MB";
    }
    if (size >= 1024) {
      return (size / 1024) + " KB";
    }
    return size + " B";
  },
  readableBytes: function(bytes) {
    if (!bytes) {
      return "???";
    }
    return String.fromCharCode.apply(null, bytes);
  }
};

module.exports = format;
