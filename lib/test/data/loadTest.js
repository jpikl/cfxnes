/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import {fetchURL, readFile} from '../../src/data/load';

describe('data/load', () => {
  it('should fetch data from valid URL', () => {
    const promise = fetchURL('roms/nestest.nes');
    return Promise.all([
      expect(promise).to.eventually.be.an('arraybuffer'),
      expect(promise).to.eventually.have.property('byteLength', 24592),
    ]);
  });

  it('should reject invalid URL', () => {
    return expect(fetchURL('invalid')).to.eventually.be.rejectedWith(Error);
  });

  it('should read file', () => {
    const promise = readFile(new File([new Uint8Array(32)], 'test'));
    return Promise.all([
      expect(promise).to.eventually.be.an('arraybuffer'),
      expect(promise).to.eventually.have.property('byteLength', 32),
    ]);
  });
});
