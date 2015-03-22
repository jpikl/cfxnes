import { Interrupt }       from "../common/types";
import { PulseChannel }    from "../channels/pulse-channel";
import { TriangleChannel } from "../channels/triangle-channel";
import { NoiseChannel }    from "../channels/noise-channel";
import { DMCChannel }      from "../channels/dmc-channel";
import { logger }          from "../utils/logger";

const CPU_FREQUENCY_NTSC = 1789773;
const CPU_FREQUENCY_PAL = CPU_FREQUENCY_NTSC * 5 / 6;

export function APU() {}

APU["dependencies"] = [ "cpu", "cpuMemory" ];

APU.prototype.init = function(cpu, cpuMemory) {
  this.cpu = cpu;
  this.pulseChannel1 = new PulseChannel(1);
  this.pulseChannel2 = new PulseChannel(2);
  this.triangleChannel = new TriangleChannel;
  this.noiseChannel = new NoiseChannel;
  this.dmcChannel = new DMCChannel(cpu, cpuMemory);
  this.channelEnabled = (function() {
    var i, results;
    results = [];
    for (i = 0; i <= 4; i++) {
      results.push(true);
    }
    return results;
  })();
  this.setNTSCMode(true);
  return this.stopRecording();
};

APU.prototype.powerUp = function() {
  logger.info("Reseting APU");
  this.clearFrameIRQ();
  this.pulseChannel1.powerUp();
  this.pulseChannel2.powerUp();
  this.triangleChannel.powerUp();
  this.noiseChannel.powerUp();
  this.dmcChannel.powerUp();
  return this.writeFrameCounter(0);
};

APU.prototype.setNTSCMode = function(ntscMode) {
  this.frameCounterMax4 = ntscMode ? [7457, 7456, 7458, 7457, 1, 1] : [8313, 8314, 8312, 8313, 1, 1];
  this.frameCounterMax5 = ntscMode ? [7457, 7456, 7458, 7458, 7452, 1] : [8313, 8314, 8312, 8314, 8312, 1];
  this.cpuFrequency = ntscMode ? CPU_FREQUENCY_NTSC : CPU_FREQUENCY_PAL;
  this.noiseChannel.setNTSCMode(ntscMode);
  return this.dmcChannel.setNTSCMode(ntscMode);
};

APU.prototype.activateFrameIRQ = function() {
  this.frameIrqActive = true;
  return this.cpu.activateInterrupt(Interrupt.IRQ_APU);
};

APU.prototype.clearFrameIRQ = function() {
  this.frameIrqActive = false;
  return this.cpu.clearInterrupt(Interrupt.IRQ_APU);
};

APU.prototype.writeFrameCounter = function(value) {
  this.frameCounterLastWrittenValue = value;
  this.frameFiveStepMode = (value & 0x80) !== 0;
  this.frameIrqDisabled = (value & 0x40) !== 0;
  this.frameStep = 0;
  this.frameCounterResetDelay = 4;
  if (this.frameCounter == null) {
    this.frameCounter = this.getFrameCounterMax();
  }
  if (this.frameIrqDisabled) {
    this.clearFrameIRQ();
  }
  if (this.frameFiveStepMode) {
    this.tickHalfFrame();
    this.tickQuarterFrame();
  }
  return value;
};

APU.prototype.getFrameCounterMax = function() {
  if (this.frameFiveStepMode) {
    return this.frameCounterMax5[this.frameStep];
  } else {
    return this.frameCounterMax4[this.frameStep];
  }
};

APU.prototype.writePulseDutyEnvelope = function(channelId, value) {
  return this.getPulseChannel(channelId).writeDutyEnvelope(value);
};

APU.prototype.writePulseSweep = function(channelId, value) {
  return this.getPulseChannel(channelId).writeSweep(value);
};

APU.prototype.writePulseTimer = function(channelId, value) {
  return this.getPulseChannel(channelId).writeTimer(value);
};

APU.prototype.writePulseLengthCounter = function(channelId, value) {
  return this.getPulseChannel(channelId).writeLengthCounter(value);
};

APU.prototype.getPulseChannel = function(channelId) {
  if (channelId === 1) {
    return this.pulseChannel1;
  } else {
    return this.pulseChannel2;
  }
};

APU.prototype.writeTriangleLinearCounter = function(value) {
  return this.triangleChannel.writeLinearCounter(value);
};

APU.prototype.writeTriangleTimer = function(value) {
  return this.triangleChannel.writeTimer(value);
};

APU.prototype.writeTriangleLengthCounter = function(value) {
  return this.triangleChannel.writeLengthCounter(value);
};

APU.prototype.writeNoiseEnvelope = function(value) {
  return this.noiseChannel.writeEnvelope(value);
};

APU.prototype.writeNoiseTimer = function(value) {
  return this.noiseChannel.writeTimer(value);
};

APU.prototype.writeNoiseLengthCounter = function(value) {
  return this.noiseChannel.writeLengthCounter(value);
};

APU.prototype.writeDMCFlagsTimer = function(value) {
  return this.dmcChannel.writeFlagsTimer(value);
};

APU.prototype.writeDMCOutputLevel = function(value) {
  return this.dmcChannel.writeOutputLevel(value);
};

APU.prototype.writeDMCSampleAddress = function(value) {
  return this.dmcChannel.writeSampleAddress(value);
};

APU.prototype.writeDMCSampleLength = function(value) {
  return this.dmcChannel.writeSampleLength(value);
};

APU.prototype.setChannelEnabled = function(id, enabled) {
  return this.channelEnabled[id] = enabled;
};

APU.prototype.isChannelEnabled = function(id) {
  return this.channelEnabled[id];
};

APU.prototype.writeStatus = function(value) {
  this.pulseChannel1.setEnabled((value & 0x01) !== 0);
  this.pulseChannel2.setEnabled((value & 0x02) !== 0);
  this.triangleChannel.setEnabled((value & 0x04) !== 0);
  this.noiseChannel.setEnabled((value & 0x08) !== 0);
  this.dmcChannel.setEnabled((value & 0x10) !== 0);
  return value;
};

APU.prototype.readStatus = function() {
  var value;
  value = this.getStatus();
  this.clearFrameIRQ();
  return value;
};

APU.prototype.getStatus = function() {
  return (this.pulseChannel1.lengthCounter > 0) | (this.pulseChannel2.lengthCounter > 0) << 1 | (this.triangleChannel.lengthCounter > 0) << 2 | (this.noiseChannel.lengthCounter > 0) << 3 | (this.dmcChannel.sampleRemainingLength > 0) << 4 | this.frameIrqActive << 6 | this.dmcChannel.irqActive << 7;
};

APU.prototype.isBlockingCPU = function() {
  return this.dmcChannel.memoryAccessCycles > 0;
};

APU.prototype.isBlockingDMA = function() {
  return this.dmcChannel.memoryAccessCycles > 2;
};

APU.prototype.tick = function() {
  this.tickFrameCounter();
  this.pulseChannel1.tick();
  this.pulseChannel2.tick();
  this.triangleChannel.tick();
  this.noiseChannel.tick();
  this.dmcChannel.tick();
  if (this.recordingActive) {
    return this.recordOutputValue();
  }
};

APU.prototype.tickFrameCounter = function() {
  if (this.frameCounterResetDelay && --this.frameCounterResetDelay === 0) {
    this.frameCounter = this.getFrameCounterMax();
  }
  if (--this.frameCounter <= 0) {
    return this.tickFrameStep();
  }
};

APU.prototype.tickFrameStep = function() {
  var ref, ref1, ref2;
  this.frameStep = (this.frameStep + 1) % 6;
  this.frameCounter = this.getFrameCounterMax();
  if ((ref = this.frameStep) === 1 || ref === 2 || ref === 3 || ref === 5) {
    this.tickQuarterFrame();
  }
  if ((ref1 = this.frameStep) === 2 || ref1 === 5) {
    this.tickHalfFrame();
  }
  if (((ref2 = this.frameStep) === 4 || ref2 === 5 || ref2 === 0) && !(this.frameIrqDisabled || this.frameFiveStepMode)) {
    return this.activateFrameIRQ();
  }
};

APU.prototype.tickQuarterFrame = function() {
  this.pulseChannel1.tickQuarterFrame();
  this.pulseChannel2.tickQuarterFrame();
  this.triangleChannel.tickQuarterFrame();
  return this.noiseChannel.tickQuarterFrame();
};

APU.prototype.tickHalfFrame = function() {
  this.pulseChannel1.tickHalfFrame();
  this.pulseChannel2.tickHalfFrame();
  this.triangleChannel.tickHalfFrame();
  return this.noiseChannel.tickHalfFrame();
};

APU.prototype.getOutputValue = function() {
  return this.getPulseOutputValue() + this.getTriangleNoiseDMCOutput();
};

APU.prototype.getPulseOutputValue = function() {
  var pulse1Value, pulse2value;
  pulse1Value = this.channelEnabled[0] ? this.pulseChannel1.getOutputValue() : 0;
  pulse2value = this.channelEnabled[1] ? this.pulseChannel2.getOutputValue() : 0;
  if (pulse1Value || pulse2value) {
    return 95.88 / (8128 / (pulse1Value + pulse2value) + 100);
  } else {
    return 0;
  }
};

APU.prototype.getTriangleNoiseDMCOutput = function() {
  var dmcValue, noiseValue, triangleValue;
  triangleValue = this.channelEnabled[2] ? this.triangleChannel.getOutputValue() : 0;
  noiseValue = this.channelEnabled[3] ? this.noiseChannel.getOutputValue() : 0;
  dmcValue = this.channelEnabled[4] ? this.dmcChannel.getOutputValue() : 0;
  if (triangleValue || noiseValue || dmcValue) {
    return 159.79 / (1 / (triangleValue / 8227 + noiseValue / 12241 + dmcValue / 22638) + 100);
  } else {
    return 0;
  }
};

APU.prototype.initRecording = function(bufferSize) {
  this.bufferSize = bufferSize;
  this.lastPosition = bufferSize - 1;
  this.recordBuffer = new Float32Array(bufferSize);
  this.recordPosition = -1;
  this.recordCycle = 0;
  this.outputBuffer = new Float32Array(bufferSize);
  return this.outputBufferFull = false;
};

APU.prototype.startRecording = function(sampleRate) {
  if (!this.recordBuffer) {
    throw "Cannot start audio recording without initialization";
  }
  this.sampleRate = sampleRate;
  this.sampleRateAdjustment = 0;
  return this.recordingActive = true;
};

APU.prototype.stopRecording = function() {
  return this.recordingActive = false;
};

APU.prototype.recordOutputValue = function() {
  var position;
  position = ~~(this.recordCycle++ * this.sampleRate / this.cpuFrequency);
  if (position > this.recordPosition) {
    return this.fillRecordBuffer(position);
  }
};

APU.prototype.fillRecordBuffer = function(position) {
  var outputValue;
  outputValue = this.getOutputValue();
  if ((position == null) || position > this.lastPosition) {
    position = this.lastPosition;
  }
  while (this.recordPosition < position) {
    this.recordBuffer[++this.recordPosition] = outputValue;
    this.sampleRate += this.sampleRateAdjustment;
  }
  if (this.recordPosition >= this.lastPosition && !this.outputBufferFull) {
    return this.swapOutputBuffer();
  }
};

APU.prototype.swapOutputBuffer = function() {
  var ref;
  ref = [this.outputBuffer, this.recordBuffer], this.recordBuffer = ref[0], this.outputBuffer = ref[1];
  this.outputBufferFull = true;
  this.recordPosition = -1;
  return this.recordCycle = 0;
};

APU.prototype.readOutputBuffer = function() {
  if (!this.outputBufferFull) {
    this.fillRecordBuffer();
  }
  this.computeSampleRateAdjustment();
  this.outputBufferFull = false;
  return this.outputBuffer;
};

APU.prototype.computeSampleRateAdjustment = function() {
  var percentageDifference;
  percentageDifference = 0.5 - this.recordPosition / this.bufferSize;
  return this.sampleRateAdjustment = 100 * percentageDifference / this.bufferSize;
};
