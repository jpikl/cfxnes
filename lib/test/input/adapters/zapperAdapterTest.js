/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Zapper from '../../../../core/src/devices/Zapper';
import ZapperAdapter from '../../../src/input/adapters/ZapperAdapter';

describe('input/adapters/ZapperAdapter', () => {
  let zapper, adapter;

  beforeEach(() => {
    zapper = new Zapper;
    adapter = new ZapperAdapter(zapper);
  });

  it('should return adapted device', () => {
    expect(adapter.getDevice()).to.be.equal(zapper);
  });

  it('should update trigger', () => {
    adapter.updateInput('trigger', true);
    expect(zapper.isTriggerPressed()).to.be.true;
    adapter.updateInput('trigger', false);
    expect(zapper.isTriggerPressed()).to.be.false;
  });

  it('should update beam position', () => {
    adapter.updateInput('beam', [10, 20]);
    expect(zapper.getBeamPosition()).to.deep.equal([10, 20]);
  });
});
