var littleEndian, system;

littleEndian = (function() {
  return true;
})();

system = {
  littleEndian: littleEndian,
  bigEndian: !littleEndian,
  allocateBytes: function(size) {
    var data, i, j, ref;
    data = new Array(size);
    for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      data[i] = 0;
    }
    return data;
  },
  allocateInts: function(size) {
    var data, i, j, ref;
    data = new Array(size);
    for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      data[i] = 0;
    }
    return data;
  }
};

module.exports = system;
