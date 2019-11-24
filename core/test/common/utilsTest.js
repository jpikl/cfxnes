import os from 'os';
import {expect} from 'chai';

import {
  detectEndianness,
} from '../../src/common/utils';

describe('common/utils', () => {
  it('detects endianness', () => {
    expect(detectEndianness()).to.equal(os.endianness());
  });
});
