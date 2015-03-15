var convert, logger;

convert = require("../utils/convert");

logger = require("../utils/logger").get();

function AbstractStorage() {}

AbstractStorage.prototype.readString = function(key) {
  return this.read(key) || null;
};

AbstractStorage.prototype.writeString = function(key, value) {
  return this.write(key, value);
};

AbstractStorage.prototype.readData = function(key, output) {
  var value;
  value = this.read(key);
  if (value != null) {
    return convert.stringToData(value, output);
  } else {
    return null;
  }
};

AbstractStorage.prototype.writeData = function(key, value) {
  return this.write(key, convert.dataToString(value));
};

AbstractStorage.prototype.readObject = function(key) {
  var value;
  value = this.read(key);
  try {
    if (value != null) {
      return convert.stringToObject(value);
    } else {
      return null;
    }
  } catch (_error) {
    logger.error("Unable to parse object from string: " + value);
    return null;
  }
};

AbstractStorage.prototype.writeObject = function(key, value) {
  return this.write(key, convert.objectToString(value));
};

module.exports = AbstractStorage;
