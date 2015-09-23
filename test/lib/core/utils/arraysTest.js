import chai from 'chai';
import * as arrays from '../../../../src/lib/core/utils/arrays';

var expect = chai.expect;

describe('Arrays utils', () => {

  it('can clear array', () => {
    expect(arrays.clearArray([1, 2, 3])).to.deep.equal([0, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], 1)).to.deep.equal([1, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], 1, 2)).to.deep.equal([1, 0, 3]);
    expect(arrays.clearArray([1, 2, 3], 0, 3)).to.deep.equal([0, 0, 0]);
    expect(arrays.clearArray([1, 2, 3], -1, 4)).to.deep.equal([0, 0, 0]);
  });

  it('can fill array', () => {
    expect(arrays.fillArray([1, 2, 3], 'x')).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1)).to.deep.equal([1, 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1, 2)).to.deep.equal([1, 'x', 3]);
    expect(arrays.fillArray([1, 2, 3], 'x', 0, 3)).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', -1, 4)).to.deep.equal(['x', 'x', 'x']);
  });

  it('can copy array', () => {
    var target = new Array(3);
    expect(arrays.copyArray([1, 2, 3])).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2], target)).to.deep.equal([1, 2, ]);
    expect(arrays.copyArray([1, 2, 3], target)).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3, 4], target)).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3], target)).to.equal(target);
  });

  it('can convert array to properties', () => {
    var mapper = {
      a: 'aa',
      b: 'bb',
      map(value) {
        return this[value];
      }
    };
    expect(arrays.arrayToProperties(['a', 'b'], value => mapper[value])).to.deep.equal({a: 'aa', b: 'bb'});
    expect(arrays.arrayToProperties(['a', 'b'], mapper.map, mapper)).to.deep.equal({a: 'aa', b: 'bb'});
  });

});
