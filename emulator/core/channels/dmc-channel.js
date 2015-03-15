var Interrupt, TIMER_PERIODS_NTSC, TIMER_PERIODS_PAL, logger;

Interrupt = require("../common/types").Interrupt;

logger = require("../utils/logger").get();

TIMER_PERIODS_NTSC = [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54];

TIMER_PERIODS_PAL = [398, 354, 316, 298, 276, 236, 210, 198, 176, 148, 132, 118, 98, 78, 66, 50];

function DMCChannel(cpu, cpuMemory) {
  this.cpu = cpu;
  this.cpuMemory = cpuMemory;
}

DMCChannel.prototype.powerUp = function() {
  logger.info("Reseting DMC channel");
  this.setEnabled(false);
  this.timerCycle = 0;
  this.sampleBuffer = null;
  this.shiftRegister = null;
  this.shiftRegisterBits = 0;
  this.memoryAccessCycles = 0;
  this.writeFlagsTimer(0);
  this.writeOutputLevel(0);
  this.writeSampleAddress(0);
  return this.writeSampleLength(0);
};

DMCChannel.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
  if (!enabled) {
    this.sampleRemainingLength = 0;
  } else if (this.sampleRemainingLength === 0) {
    this.sampleCurrentAddress = this.sampleAddress;
    this.sampleRemainingLength = this.sampleLength;
  }
  return this.cpu.clearInterrupt(Interrupt.IRQ_DCM);
};

DMCChannel.prototype.setNTSCMode = function(ntscMode) {
  return this.timerPeriods = ntscMode ? TIMER_PERIODS_NTSC : TIMER_PERIODS_PAL;
};

DMCChannel.prototype.writeFlagsTimer = function(value) {
  this.irqEnabled = (value & 0x80) !== 0;
  this.sampleLoop = (value & 0x40) !== 0;
  this.timerPeriod = this.timerPeriods[value & 0x0F];
  if (!this.irqEnabled) {
    this.cpu.clearInterrupt(Interrupt.IRQ_DCM);
  }
  return value;
};

DMCChannel.prototype.writeOutputLevel = function(value) {
  this.outputValue = value & 0x7F;
  return value;
};

DMCChannel.prototype.writeSampleAddress = function(value) {
  this.sampleAddress = 0xC000 | ((value & 0xFF) << 6);
  return value;
};

DMCChannel.prototype.writeSampleLength = function(value) {
  this.sampleLength = (value & 0xFF) << 4 | 0x01;
  return value;
};

DMCChannel.prototype.tick = function() {
  if (this.memoryAccessCycles > 0) {
    this.memoryAccessCycles--;
  }
  if (--this.timerCycle <= 0) {
    this.timerCycle = this.timerPeriod;
    return this.updateSample();
  }
};

DMCChannel.prototype.updateSample = function() {
  this.updateSampleBuffer();
  this.updateShiftRegister();
  return this.updateOutputValue();
};

DMCChannel.prototype.updateSampleBuffer = function() {
  if (this.sampleBuffer === null && this.sampleRemainingLength > 0) {
    this.sampleBuffer = this.cpuMemory.read(this.sampleCurrentAddress);
    this.memoryAccessCycles = 4;
    if (this.sampleCurrentAddress < 0xFFFF) {
      this.sampleCurrentAddress++;
    } else {
      this.sampleCurrentAddress = 0x8000;
    }
    if (--this.sampleRemainingLength <= 0) {
      if (this.sampleLoop) {
        this.sampleCurrentAddress = this.sampleAddress;
        return this.sampleRemainingLength = this.sampleLength;
      } else if (this.irqEnabled) {
        return this.cpu.activateInterrupt(Interrupt.IRQ_DCM);
      }
    }
  }
};

DMCChannel.prototype.updateShiftRegister = function() {
  if (--this.shiftRegisterBits <= 0) {
    this.shiftRegisterBits = 8;
    this.shiftRegister = this.sampleBuffer;
    return this.sampleBuffer = null;
  }
};

DMCChannel.prototype.updateOutputValue = function() {
  if (this.shiftRegister !== null) {
    if (this.shiftRegister & 0x1) {
      if (this.outputValue <= 125) {
        this.outputValue += 2;
      }
    } else {
      if (this.outputValue >= 2) {
        this.outputValue -= 2;
      }
    }
    return this.shiftRegister >>>= 1;
  }
};

DMCChannel.prototype.getOutputValue = function() {
  return this.outputValue;
};

module.exports = DMCChannel;
