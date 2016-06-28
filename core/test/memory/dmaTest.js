/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import {expect} from 'chai';
import DMA from '../../src/memory/DMA';

describe('memory/DMA', () => {
  it('should transfer data', () => {
    // Not using sinon.spy (too slow in this case)
    let readCount = 0, writeCount = 0;
    const cpuMemory = {
      read: () => readCount++,
      write: () => writeCount++,
    };

    const dma = new DMA;
    dma.connect({cpuMemory});
    dma.reset();
    expect(dma.isBlockingCPU()).to.be.false;

    dma.writeAddress(0);
    expect(dma.isBlockingCPU()).to.be.true;

    while (dma.isBlockingCPU()) {
      dma.tick();
    }

    expect(readCount).to.be.equal(256);
    expect(writeCount).to.be.equal(256);
  });
});
