var  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

function Zapper() {
  this.setTriggerPressed = bind(this.setTriggerPressed, this);
}

Zapper.dependencies = ["ppu"];

Zapper.prototype.init = function(ppu) {
  this.ppu = ppu;
  this.triggerPressed = 0;
  this.beamX = 0;
  return this.beamY = 0;
};

Zapper.prototype.strobe = function() {};

Zapper.prototype.read = function() {
  return this.triggerPressed << 4 | !this.isLightDetected() << 3;
};

Zapper.prototype.isLightDetected = function() {
  return this.beamX && this.beamY && this.ppu.isBrightFramePixel(this.beamX, this.beamY);
};

Zapper.prototype.setTriggerPressed = function(pressed) {
  return this.triggerPressed = pressed;
};

Zapper.prototype.setBeamPosition = function(x, y) {
  this.beamX = x;
  return this.beamY = y;
};

module.exports = Zapper;
