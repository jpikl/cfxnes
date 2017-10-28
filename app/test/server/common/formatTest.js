import {expect} from 'chai';
import {makeId, sanitizeName, makeSeparator} from '../../../src/server/common/format';

describe('server/common/format', () => {
  it('makes ID', () => {
    expect(makeId('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('ab-cd-ef-gh-ij');
  });

  it('sanitizes name', () => {
    expect(sanitizeName('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('Ab_Cd_Ef_Gh_Ij');
  });

  it('makes separator', () => {
    expect(makeSeparator('=', 10)).to.be.equal('==========');
    expect(makeSeparator('=', 10, 'test')).to.be.equal('==[test]==');
  });
});
