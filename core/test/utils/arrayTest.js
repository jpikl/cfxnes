/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import * as arrays from '../../src/utils/array';

const expect = chai.expect;

describe('Arrays utils', () => {
  it('can create array', () => {
    expect(arrays.createArray(0)).to.deep.equal([]);
    expect(arrays.createArray(2)).to.deep.equal([0, 0]);
    expect(arrays.createArray(2, 'x')).to.deep.equal(['x', 'x']);
  });

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
});
