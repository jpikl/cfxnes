import chai from 'chai';
import * as format from '../../src/utils/format';

var expect = chai.expect;

describe('Format utils', () => {

  it('can format number as hex', () => {
    expect(format.numberAsHex(0x12EF)).to.equal('12EF');
  });

  it('can format byte as hex', () => {
    expect(format.byteAsHex(0x0F)).to.equal('0F');
    expect(format.byteAsHex(0xEF)).to.equal('EF');
  });

  it('can format word as hex', () => {
    expect(format.wordAsHex(0x000F)).to.equal('000F');
    expect(format.wordAsHex(0x00EF)).to.equal('00EF');
    expect(format.wordAsHex(0x02EF)).to.equal('02EF');
    expect(format.wordAsHex(0x12EF)).to.equal('12EF');
  });

  it('can fill characters from left', () => {
    expect(format.fillLeft('ABC', 6)).to.equal('   ABC');
    expect(format.fillLeft('ABC', 6, 'xxx')).to.equal('xxxABC');
    expect(format.fillLeft('ABC', 2)).to.equal('BC');
  });

  it('can fill characters from right', () => {
    expect(format.fillRight('ABC', 6)).to.equal('ABC   ');
    expect(format.fillRight('ABC', 6, 'xxx')).to.equal('ABCxxx');
    expect(format.fillRight('ABC', 2)).to.equal('AB');
  });

  it('can capitalize words', () => {
    expect(format.capitalize('nintendo entertainment system')).to.equal('Nintendo Entertainment System');
  });

  it('can format optional value', () => {
    expect(format.formatOptional('value')).to.equal('value');
    expect(format.formatOptional(null)).to.equal('???');
  });

  it('can format size', () => {
    expect(format.formatSize(0)).to.equal('0 B');
    expect(format.formatSize(2)).to.equal('2 B');
    expect(format.formatSize(4 * 1024)).to.equal('4 KB');
    expect(format.formatSize(8 * 1024 * 1024)).to.equal('8 MB');
    expect(format.formatSize(-1)).to.equal('-1 B');
    expect(format.formatSize('not a number')).to.be.undefined;
  });

  it('can format data', () => {
    expect(format.formatData(null)).to.be.undefined;
    expect(format.formatData(0)).to.be.undefined;
    expect(format.formatData([0x61, 0x62, 0x63])).to.equal('abc');
  });

});
