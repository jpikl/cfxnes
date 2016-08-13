/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import {nvramStore, closeDB, deleteDB} from '../../src/data/database';

describe('data/database', () => {
  beforeEach(deleteDB);
  after(closeDB);

  it('does not load unsaved NVRAM', () => {
    return expect(nvramStore.get('x')).to.eventually.be.null;
  });

  it('saves/loads NVRAM', () => {
    const result = nvramStore.put('x', new Uint8Array(10))
      .then(() => nvramStore.get('x'));
    return expect(result).to.eventually.deep.equal(new Uint8Array(10));
  });

  it('deletes all saved NVRAMs', () => {
    const result = nvramStore.put('x', new Uint8Array(10))
      .then(() => nvramStore.clear())
      .then(() => nvramStore.get('x'));
    return expect(result).to.eventually.be.null;
  });
});
