/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Zapper from '../../src/devices/Zapper';

const nes = {
  ppu: {
    isBrightFramePixel(x, y) {
      return x > y;
    },
  },
};

describe('Zapper', () => {
  let zapper;

  beforeEach(() => {
    zapper = new Zapper;
    zapper.connect(nes);
  });

  afterEach(() => {
    zapper.disconnect(nes);
  });

  it('should read state', () => {
    expect(zapper.read()).to.be.equal(0x08);
    zapper.setBeamPosition(0, 1);
    expect(zapper.read()).to.be.equal(0x08);
    zapper.setBeamPosition(1, 0);
    expect(zapper.read()).to.be.equal(0x00);
    zapper.setTriggerPressed(true);
    expect(zapper.read()).to.be.equal(0x10);
    zapper.setBeamPosition(0, 1);
    expect(zapper.read()).to.be.equal(0x18);
  });

  it('should strobe with no effect', () => {
    zapper.strobe();
  });
});
