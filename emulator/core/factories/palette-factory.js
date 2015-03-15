function PaletteFactory() {
  this.palettes = {
    "default": require("../palettes/default-palette"),
    "bright": require("../palettes/bright-palette"),
    "realistic": require("../palettes/realistic-palette")
  };
}

PaletteFactory.prototype.createPalette = function(id) {
  return this.palettes[id];
};

module.exports = PaletteFactory;
