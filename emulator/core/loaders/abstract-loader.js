function AbstractLoader(reader1) {
  this.reader = reader1;
}

AbstractLoader.containsSignature = function(reader, signature) {
  var header, i, j, len, signatureByte;
  header = reader.read(signature.length);
  for (i = j = 0, len = signature.length; j < len; i = ++j) {
    signatureByte = signature[i];
    if (signatureByte !== header[i]) {
      return false;
    }
  }
  return true;
};

AbstractLoader.prototype.loadCartridge = function(cartridge) {
  this.cartridge = cartridge != null ? cartridge : {};
  this.reader.reset();
  this.readCartridge();
  return this.cartridge;
};

AbstractLoader.prototype.readByte = function() {
  return (this.readArray(1))[0];
};

AbstractLoader.prototype.readArray = function(size) {
  var result;
  result = this.reader.read(size);
  if ((result != null ? result.length : void 0) !== size) {
    throw new Error("Unexpected end of file.");
  }
  return result;
};

AbstractLoader.prototype.checkSignature = function(bytes) {
  if (!AbstractLoader.containsSignature(this.reader, bytes)) {
    throw new Error("Invalid file signature.");
  }
};


module.exports = AbstractLoader;
