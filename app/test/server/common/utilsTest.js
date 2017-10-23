import {expect} from 'chai';
import {makeId, sanitizeName, removePrefix} from '../../../src/server/common/utils';

describe('server/common/utils', () => {
  it('makes ID', () => {
    expect(makeId('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('ab-cd-ef-gh-ij');
  });

  it('sanitizes name', () => {
    expect(sanitizeName('  __-- Ab-Cd_Ef Gh+*/%  __--Ij  __--')).to.be.equal('Ab_Cd_Ef_Gh_Ij');
  });

  it('removes prefix', () => {
    expect(removePrefix('foobar', 'bar')).to.be.equal('foobar');
    expect(removePrefix('foobar', 'foo')).to.be.equal('bar');
    expect(removePrefix('foobar', 'Foo')).to.be.equal('foobar');
    expect(removePrefix('foobar', 'Foo', true)).to.be.equal('bar');
  });
});
