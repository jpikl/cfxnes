/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Zapper from '../../src/devices/Zapper';

describe('devices/Zapper', () => {
  const nes = {ppu: {isBrightFramePixel(x, y) { return x > y; }}};
  let zapper;

  beforeEach(() => {
    zapper = new Zapper;
    zapper.connect(nes);
  });

  afterEach(() => {
    zapper.disconnect(nes);
  });

  it('should get/set trigger pressed', () => {
    expect(zapper.isTriggerPressed()).to.be.false;
    zapper.setTriggerPressed(true);
    expect(zapper.isTriggerPressed()).to.be.true;
  });

  it('should get/set beam position', () => {
    expect(zapper.getBeamPosition()).to.deep.equal([-1, -1]);
    zapper.setBeamPosition(10, 20);
    expect(zapper.getBeamPosition()).to.deep.equal([10, 20]);
  });

  it('should read correct initial state', () => {
    expect(zapper.read()).to.be.equal(0x08);
  });

  it('should read correct state (light: off, trigger: off)', () => {
    zapper.setBeamPosition(0, 1);
    zapper.setTriggerPressed(false);
    expect(zapper.read()).to.be.equal(0x08);
  });

  it('should read correct state (light: off, trigger: on)', () => {
    zapper.setBeamPosition(0, 1);
    zapper.setTriggerPressed(true);
    expect(zapper.read()).to.be.equal(0x18);
  });

  it('should read correct state (light: on, trigger: off)', () => {
    zapper.setBeamPosition(2, 1);
    zapper.setTriggerPressed(false);
    expect(zapper.read()).to.be.equal(0x00);
  });

  it('should read correct state (light: on, trigger: on)', () => {
    zapper.setBeamPosition(2, 1);
    zapper.setTriggerPressed(true);
    expect(zapper.read()).to.be.equal(0x10);
  });

  it('should strobe with no effect', () => {
    zapper.strobe();
  });
});
