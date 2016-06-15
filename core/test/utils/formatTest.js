/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import chai from 'chai';
import * as format from '../../src/utils/format';

const expect = chai.expect;

describe('Format utils', () => {
  it('can format size', () => {
    expect(format.formatSize(0)).to.equal('0 B');
    expect(format.formatSize(2)).to.equal('2 B');
    expect(format.formatSize(4 * 1024)).to.equal('4 KB');
    expect(format.formatSize(8 * 1024 * 1024)).to.equal('8 MB');
    expect(format.formatSize(-1)).to.equal('-1 B');
    expect(format.formatSize('not a number')).to.be.undefined;
  });
});
