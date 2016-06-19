/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import {createMapper} from '../src/mappers';

const ids = [
  'AOROM',
  'BNROM',
  'CNROM',
  'ColorDreams',
  'MMC1',
  'MMC3',
  'NINA-001',
  'NROM',
  'UNROM',
];

describe('mappers', () => {
  it('should create mapper for valid ID', () => {
    for (const id of ids) {
      expect(createMapper({mapper: id})).to.be.an('object');
    }
  });

  it('should throw error for invalid ID', () => {
    expect(() => createMapper({mapper: 'x'})).to.throw(Error);
  });
});
