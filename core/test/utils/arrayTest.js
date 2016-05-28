/* eslint-env mocha */
/* eslint-disable no-sparse-arrays */

import chai from 'chai';
import * as arrays from '../../src/utils/array';

const expect = chai.expect;

describe('Arrays utils', () => {
  it('can zero array', () => {
    let array;
    expect(arrays.zeroArray(array = [])).to.equal(array);
    expect(arrays.zeroArray([1, 2, 3])).to.deep.equal([0, 0, 0]);
    expect(arrays.zeroArray([1, 2, 3], 1)).to.deep.equal([1, 0, 0]);
    expect(arrays.zeroArray([1, 2, 3], 1, 2)).to.deep.equal([1, 0, 3]);
    expect(arrays.zeroArray([1, 2, 3], 0, 4)).to.deep.equal([0, 0, 0]);
  });

  it('can fill array', () => {
    let array;
    expect(arrays.fillArray(array = [])).to.equal(array);
    expect(arrays.fillArray([1, 2, 3], 'x')).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1)).to.deep.equal([1, 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1, 2)).to.deep.equal([1, 'x', 3]);
    expect(arrays.fillArray([1, 2, 3], 'x', 0, 4)).to.deep.equal(['x', 'x', 'x']);
  });

  it('can copy array', () => {
    let array;
    expect(arrays.copyArray(array = [])).not.to.equal(array);
    expect(arrays.copyArray([], array = [])).to.equal(array);
    expect(arrays.copyArray([1, 2, 3])).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2], new Array(3))).to.deep.equal([1, 2]);
    expect(arrays.copyArray([1, 2, 3], new Array(3))).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3, 4], new Array(3))).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1)).to.deep.equal([2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 1)).to.deep.equal([, 2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 1, 1)).to.deep.equal([, 2]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 2, 3)).to.deep.equal([,, 2]);
  });
});
