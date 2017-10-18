import {expect} from 'chai';
import {getSanitizedFileName} from '../../../src/server/common/path';

describe('server/common/path', () => {
  it('makes sanitized filename', () => {
    expect(getSanitizedFileName('/path/to/dir/ New Test-File - X_.png')).to.be.equal('New_Test_File_X.png');
  });
});
