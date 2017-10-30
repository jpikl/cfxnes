import {expect} from 'chai';
import {createId, sanitizeName} from '../../../src/server/common/format';

describe('server/common/format', () => {
  it('creates ID', () => {
    expect(createId('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('ab-cd-ef-gh-ij');
  });

  it('sanitizes name', () => {
    expect(sanitizeName('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('Ab_Cd_Ef_Gh_Ij');
  });
});
