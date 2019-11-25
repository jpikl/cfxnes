import os from 'os';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import isLittleEndian from '../../src/common/isLittleEndian';

describe('common/isLittleEndian', () => {
  it('detects endianness', () => {
    expect(isLittleEndian()).to.equal(os.endianness() === 'LE');
  });
});
