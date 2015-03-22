import { logger } from "../utils/logger";

const TOTAL_DMA_CYCLES = 0x200;

export function DMA() {}

DMA["dependencies"] = ["cpuMemory"];

DMA.prototype.init = function(cpuMemory) {
  return this.cpuMemory = cpuMemory;
};

DMA.prototype.powerUp = function() {
  logger.info("Reseting DMA");
  return this.cyclesCount = TOTAL_DMA_CYCLES;
};

DMA.prototype.writeAddress = function(address) {
  this.cyclesCount = 0;
  this.baseAddress = address << 8;
  return address;
};

DMA.prototype.tick = function() {
  if (this.isBlockingCPU()) {
    this.cyclesCount++;
    if (this.cyclesCount & 1) {
      return this.transferData();
    }
  }
};

DMA.prototype.isBlockingCPU = function() {
  return this.cyclesCount < TOTAL_DMA_CYCLES;
};

DMA.prototype.transferData = function() {
  var address, data;
  address = this.baseAddress + (this.cyclesCount >> 1);
  data = this.cpuMemory.read(address);
  return this.cpuMemory.write(0x2004, data);
};
