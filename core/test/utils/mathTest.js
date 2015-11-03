import chai from 'chai';
import os from 'os';
import * as math from '../../src/utils/math';

var expect = chai.expect;

describe('Math utils', () => {

  it('can round up to power of 2', () => {
    expect(math.roundUpToPowerOf2(0)).to.equal(1);
    expect(math.roundUpToPowerOf2(1)).to.equal(1);
    expect(math.roundUpToPowerOf2(7)).to.equal(8);
    expect(math.roundUpToPowerOf2(1023)).to.equal(1024);
  });

});