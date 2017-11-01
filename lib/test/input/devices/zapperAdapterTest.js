import {Zapper} from '../../../../core';
import ZapperAdapter from '../../../src/input/devices/ZapperAdapter';

describe('input/devices/ZapperAdapter', () => {
  let zapper, adapter;

  beforeEach(() => {
    zapper = new Zapper;
    adapter = new ZapperAdapter(zapper);
  });

  it('provides adapted device', () => {
    expect(adapter.getDevice()).to.equal(zapper);
  });

  it('changes trigger state', () => {
    adapter.setInput('trigger', true);
    expect(adapter.getInput('trigger')).to.be.true;
    expect(zapper.isTriggerPressed()).to.be.true;
    adapter.setInput('trigger', false);
    expect(adapter.getInput('trigger')).to.be.false;
    expect(zapper.isTriggerPressed()).to.be.false;
  });

  it('throws error for invalid trigger state', () => {
    expect(() => adapter.setInput('trigger', null)).to.throw('Invalid zapper trigger state: null');
  });

  it('changes beam position', () => {
    adapter.setInput('beam', [10, 20]);
    expect(adapter.getInput('beam')).to.deep.equal([10, 20]);
    expect(zapper.getBeamPosition()).to.deep.equal([10, 20]);
  });

  it('throws error for invalid beam position', () => {
    expect(() => adapter.setInput('beam', null)).to.throw('Invalid zapper beam position: null');
    expect(() => adapter.setInput('beam', [0])).to.throw('Invalid zapper beam position: Array(1)');
    expect(() => adapter.setInput('beam', [null, 0])).to.throw('Invalid zapper beam X position: null');
    expect(() => adapter.setInput('beam', [0, null])).to.throw('Invalid zapper beam Y position: null');
  });

  it('throws error for invalid input', () => {
    expect(() => adapter.setInput(null, null)).to.throw('Invalid zapper input: null');
  });
});
