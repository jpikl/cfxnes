import {expect} from 'chai';
import Dma from '../../src/memory/Dma';

describe('memory/DMA', () => {
  let dma, reads, writes;

  const cpuMemory = {
    read: () => reads++,
    write: () => writes++,
  };

  beforeEach(() => {
    reads = 0;
    writes = 0;
    dma = new Dma;
    dma.connect({cpuMemory});
    dma.reset();
  });

  it('does not block CPU by default', () => {
    expect(dma.isBlockingCpu()).to.be.false;
  });

  it('blocks CPU after address write', () => {
    dma.writeAddress(0);
    expect(dma.isBlockingCpu()).to.be.true;
  });

  it('transfers 256B of data during 512 cycles', () => {
    let cycles = 0;
    dma.writeAddress(0);
    while (dma.isBlockingCpu()) {
      dma.tick();
      cycles++;
    }
    expect(cycles).to.equal(512);
    expect(reads).to.equal(256);
    expect(writes).to.equal(256);
  });
});
