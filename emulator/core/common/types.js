var Interrupt, Mirroring, TVSystem;

Interrupt = {
  RESET: 0x01,
  NMI: 0x02,
  IRQ_APU: 0x04,
  IRQ_DCM: 0x08,
  IRQ_EXT: 0x10
};

Interrupt.IRQ = Interrupt.IRQ_APU | Interrupt.IRQ_DCM | Interrupt.IRQ_EXT;

module.exports.Interrupt = Interrupt;

Mirroring = {
  SINGLE_SCREEN_0: 1,
  SINGLE_SCREEN_1: 2,
  SINGLE_SCREEN_2: 3,
  SINGLE_SCREEN_3: 4,
  HORIZONTAL: 5,
  VERTICAL: 6,
  FOUR_SCREEN: 7,
  getSingleScreen: function(area) {
    return Mirroring.SINGLE_SCREEN_0 + area;
  },
  toString: function(mirroring) {
    switch (mirroring) {
      case Mirroring.SINGLE_SCREEN_0:
        return "single screen (0)";
      case Mirroring.SINGLE_SCREEN_1:
        return "single screen (1)";
      case Mirroring.SINGLE_SCREEN_2:
        return "single screen (2)";
      case Mirroring.SINGLE_SCREEN_3:
        return "single screen (3)";
      case Mirroring.HORIZONTAL:
        return "horizontal";
      case Mirroring.VERTICAL:
        return "vertical";
      case Mirroring.FOUR_SCREEN:
        return "four screen";
      default:
        return "???";
    }
  }
};

module.exports.Mirroring = Mirroring;

TVSystem = {
  NTSC: 1,
  PAL: 2,
  toString: function(tvSystem) {
    switch (tvSystem) {
      case TVSystem.PAL:
        return "PAL";
      case TVSystem.NTSC:
        return "NTSC";
      default:
        return "???";
    }
  }
};

module.exports.TVSystem = TVSystem;
