var convert;

convert = {
  computeMD5: md5,
  dataToString: function(input) {
    return String.fromCharCode.apply(null, input);
  },
  stringToData: function(input, output) {
    var i, j, ref;
    if (output == null) {
      output = Uint8Array(input.length);
    }
    for (i = j = 0, ref = input.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      output[i] = input.charCodeAt(i);
    }
    return output;
  },
  objectToString: function(input) {
    return JSON.stringify(input);
  },
  stringToObject: function(input) {
    return JSON.parse(input);
  }
};

module.exports = convert;
