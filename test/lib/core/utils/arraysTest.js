import chai from 'chai';
import * as arrays from '../../../../src/lib/core/utils/arrays';

var expect = chai.expect;

describe('Arrays utils', () => {

  it('can clear array', () => {
    var array;
    expect(arrays.clearArray(array = [])).to.equal(array);
    expect(arrays.clearArray([1, 2, 3])).to.deep.equal([0, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], 1)).to.deep.equal([1, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], 1, 2)).to.deep.equal([1, 0, 3]);
    expect(arrays.clearArray([1, 2, 3], 0, 3)).to.deep.equal([0, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], -1, 4)).to.deep.equal([0, 0, 0]);
  });

  it('can fill array', () => {
    var array;
    expect(arrays.fillArray(array = [])).to.equal(array);
    expect(arrays.fillArray([1, 2, 3], 'x')).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1)).to.deep.equal([1, 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1, 2)).to.deep.equal([1, 'x', 3]);
    expect(arrays.fillArray([1, 2, 3], 'x', 0, 3)).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', -1, 4)).to.deep.equal(['x', 'x', 'x']);
  });

  it('can copy array', () => {
    var array;
    expect(arrays.copyArray(array = [])).not.to.equal(array);
    expect(arrays.copyArray([], array = [])).to.equal(array);
    expect(arrays.copyArray([1, 2, 3])).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2], new Array(3))).to.deep.equal([1, 2, ]);
    expect(arrays.copyArray([1, 2, 3], new Array(3))).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3, 4], new Array(3))).to.deep.equal([1, 2, 3]);
  });

  it('can convert array to properties', () => {
    var mapper = {
      a: 1,
      b: 2,
      map(value) {
        return this[value];
      }
    };
    expect(arrays.arrayToProperties(['a', 'b'], value => mapper[value])).to.deep.equal({a: 1, b: 2});
    expect(arrays.arrayToProperties(['a', 'b'], mapper.map, mapper)).to.deep.equal({a: 1, b: 2});
  });

});
