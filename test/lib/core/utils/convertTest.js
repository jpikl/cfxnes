import chai from 'chai';
import * as convert from '../../../../src/lib/core/utils/convert';

var expect = chai.expect;

describe('Convert utils', () => {

  it('can convert between object and string', () => {
    var obj = {a: 1, b: 'x', c: [1, 2], d: {e: 1}};
    expect(convert.stringToObject(convert.objectToString(obj))).not.to.equal(obj);
    expect(convert.stringToObject(convert.objectToString(obj))).to.deep.equal(obj);
  });

  it('can convert between data and string', () => {
    var input = Uint8Array.of(1, 2, 3);
    var output;
    expect(convert.stringToData(convert.dataToString(input))).not.to.equal(input);
    expect(convert.stringToData(convert.dataToString(input))).to.deep.equal(input);
    expect(convert.stringToData(convert.dataToString(input), output = new Uint8Array(3))).to.equal(output);
    expect(convert.stringToData(convert.dataToString(input), new Uint8Array(3))).not.to.equal(input);
    expect(convert.stringToData(convert.dataToString(input), new Uint8Array(3))).to.deep.equal(input);
  });

  it('can convert data to base64', () => {
    expect(convert.dataToBase64(Uint8Array.of(0x61, 0x62, 0x63))).to.equal('YWJj');
  });

  it('can convert base64 to data', () => {
    expect(convert.base64ToData('YWJj')).to.deep.equal(Uint8Array.of(0x61, 0x62, 0x63));
  });

  it('can encode base64', () => {
    expect(convert.encodeBase64('abc')).to.equal('YWJj');
  });

  it('can decode base64', () => {
    expect(convert.decodeBase64('YWJj')).to.equal('abc');
  });

});
