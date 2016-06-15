/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import os from 'os';
import {expect} from 'chai';
import * as utils from '../src/utils';

describe('utility functions', () => {
  it('can pack color', () => {
    expect(utils.packColorLE(0x12, 0x34, 0x56, 0x78)).to.equal(0x78563412);
    expect(utils.packColorBE(0x12, 0x34, 0x56, 0x78)).to.equal(0x12345678);
    expect(utils.packColorLE(0x12, 0x34, 0x56)).to.equal(0xFF563412);
    expect(utils.packColorBE(0x12, 0x34, 0x56)).to.equal(0x123456FF);
  });

  it('can unpack color', () => {
    expect(utils.unpackColorLE(0x78563412)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(utils.unpackColorBE(0x12345678)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });

  it('can detect endianness', () => {
    expect(utils.isLittleEndian()).to.be.equal(os.endianness() === 'LE');
  });

  it('can format size', () => {
    expect(utils.formatSize(0)).to.equal('0 B');
    expect(utils.formatSize(2)).to.equal('2 B');
    expect(utils.formatSize(4 * 1024)).to.equal('4 KB');
    expect(utils.formatSize(8 * 1024 * 1024)).to.equal('8 MB');
    expect(utils.formatSize(-1)).to.equal('-1 B');
    expect(utils.formatSize('not a number')).to.be.undefined;
  });

  it('can round up to power of 2', () => {
    expect(utils.roundUpToPowerOf2(0)).to.equal(1);
    expect(utils.roundUpToPowerOf2(1)).to.equal(1);
    expect(utils.roundUpToPowerOf2(7)).to.equal(8);
    expect(utils.roundUpToPowerOf2(1023)).to.equal(1024);
  });
});
