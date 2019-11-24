import {expect} from 'chai';
import formatSize from '../../src/common/formatSize';

describe('common/formatSize', () => {
  it('formats zero size', () => {
    expect(formatSize(0)).to.equal('0 B');
  });

  it('formats size in bytes', () => {
    expect(formatSize(2)).to.equal('2 B');
  });

  it('formats size in kilobytes', () => {
    expect(formatSize(4 * 1024)).to.equal('4 KB');
  });

  it('formats size in megabytes', () => {
    expect(formatSize(8 * 1024 * 1024)).to.equal('8 MB');
  });

  it('formats size with decimal part as rounded', () => {
    expect(formatSize(8.5 * 1024 * 1024)).to.equal('8.5 MB');
    expect(formatSize(8.1234 * 1024 * 1024)).to.equal('8.123 MB');
  });

  it('formats negative size', () => {
    expect(formatSize(-1)).to.equal('-1 B');
    expect(formatSize(-3 * 1024)).to.equal('-3 KB');
    expect(formatSize(-7 * 1024 * 1024)).to.equal('-7 MB');
  });

  it('formats undefined size', () => {
    expect(formatSize(undefined)).to.be.undefined;
  });
});
