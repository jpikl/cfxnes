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

  it('has trigger not pressed by default', () => {
    expect(zapper.isTriggerPressed()).to.be.false;
  });

  it('changes trigger state', () => {
    zapper.setTriggerPressed(true);
    expect(zapper.isTriggerPressed()).to.be.true;
    zapper.setTriggerPressed(false);
    expect(zapper.isTriggerPressed()).to.be.false;
  });

  it('has [-1, -1] beam position by default', () => {
    expect(zapper.getBeamPosition()).to.deep.equal([-1, -1]);
  });

  it('changes beam position', () => {
    zapper.setBeamPosition(10, 20);
    expect(zapper.getBeamPosition()).to.deep.equal([10, 20]);
  });

  it('reads correct initial state', () => {
    expect(zapper.read()).to.equal(0x08);
  });

  it('reads correct state (light: off, trigger: off)', () => {
    zapper.setBeamPosition(0, 1);
    zapper.setTriggerPressed(false);
    expect(zapper.read()).to.equal(0x08);
  });

  it('reads correct state (light: off, trigger: on)', () => {
    zapper.setBeamPosition(0, 1);
    zapper.setTriggerPressed(true);
    expect(zapper.read()).to.equal(0x18);
  });

  it('reads correct state (light: on, trigger: off)', () => {
    zapper.setBeamPosition(2, 1);
    zapper.setTriggerPressed(false);
    expect(zapper.read()).to.equal(0x00);
  });

  it('reads correct state (light: on, trigger: on)', () => {
    zapper.setBeamPosition(2, 1);
    zapper.setTriggerPressed(true);
    expect(zapper.read()).to.equal(0x10);
  });

  it('strobes with no effect', () => {
    zapper.strobe();
  });
});
