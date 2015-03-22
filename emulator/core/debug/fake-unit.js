function FakeUnit() {}

FakeUnit.prototype.powerUp = function() {};

FakeUnit.prototype.connectMapper = function() {};

FakeUnit.prototype.setNTSCMode = function() {};

FakeUnit.prototype.tick = function() {};

FakeUnit.prototype.readStatus = function() {
  return 0;
};

FakeUnit.prototype.writeControl = function(value) {
  return value;
};

FakeUnit.prototype.writeMask = function(value) {
  return value;
};

FakeUnit.prototype.writeAddress = function(value) {
  return value;
};

FakeUnit.prototype.writeData = function(value) {
  return value;
};

FakeUnit.prototype.writeScroll = function(value) {
  return value;
};

FakeUnit.prototype.writeOAMAddress = function(value) {
  return value;
};

FakeUnit.prototype.writeOAMData = function(value) {
  return value;
};

FakeUnit.prototype.writeFrameCounter = function(value) {
  return value;
};

FakeUnit.prototype.writeStatus = function(value) {
  return value;
};

FakeUnit.prototype.writePulseDutyEnvelope = function(value) {
  return value;
};

FakeUnit.prototype.writePulseSweep = function(value) {
  return value;
};

FakeUnit.prototype.writePulseTimer = function(value) {
  return value;
};

FakeUnit.prototype.writePulseLengthCounter = function(value) {
  return value;
};

FakeUnit.prototype.writeTriangleLinearCounter = function(value) {
  return value;
};

FakeUnit.prototype.writeTriangleTimer = function(value) {
  return value;
};

FakeUnit.prototype.writeTriangleLengthCounter = function(value) {
  return value;
};

FakeUnit.prototype.writeNoiseEnvelope = function(value) {
  return value;
};

FakeUnit.prototype.writeNoiseTimer = function(value) {
  return value;
};

FakeUnit.prototype.writeNoiseLengthCounter = function(value) {
  return value;
};

FakeUnit.prototype.writeDMCSampleLength = function(value) {
  return value;
};

FakeUnit.prototype.writeDMCSampleAddress = function(value) {
  return value;
};

FakeUnit.prototype.writeDMCOutputLevel = function(value) {
  return value;
};

FakeUnit.prototype.writeDMCFlagsTimer = function(value) {
  return value;
};

FakeUnit.prototype.isBlockingCPU = function() {
  return false;
};

FakeUnit.prototype.isBlockingDMA = function() {
  return false;
};

module.exports = FakeUnit;
