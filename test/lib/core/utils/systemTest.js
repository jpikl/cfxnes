import chai from 'chai';
import os from 'os';
import * as system from '../../../../src/lib/core/utils/system';

var expect = chai.expect;

describe('System utils', () => {

  it('can detect endianness', () => {
    expect(system.detectEndianness()).to.equal(os.endianness());
    expect(system.ENDIANNESS).to.equal(os.endianness());
  });

});
