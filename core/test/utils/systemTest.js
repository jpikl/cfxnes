/* eslint-env mocha */

import os from 'os';
import chai from 'chai';
import * as system from '../../src/utils/system';

const expect = chai.expect;

describe('System utils', () => {
  it('can detect endianness', () => {
    expect(system.detectEndianness()).to.equal(os.endianness());
    expect(system.ENDIANNESS).to.equal(os.endianness());
  });
});
