import { PPU } from "../units/ppu";

  var
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;


export function DebugPPU() {
  return DebugPPU.__super__.constructor.apply(this, arguments);
}

extend(DebugPPU, PPU);

DebugPPU.prototype.updateRGBAPalette = function() {
};

DebugPPU.prototype.setFramePixel = function() {
};

DebugPPU.prototype.clearFramePixel = function() {
};

