function AbstractReader() {
  this.reset();
}

AbstractReader.prototype.reset = function() {
  return this.position = 0;
};

AbstractReader.prototype.read = function(size) {
  return this.getData(this.position, this.movePosition(size));
};

AbstractReader.prototype.movePosition = function(size) {
  if (size == null) {
    size = this.getLength();
  }
  return this.position = Math.min(this.position + size, this.getLength());
};

module.exports = AbstractReader;
