import path from 'path';
import {expect} from 'chai';
import {resolvePath} from '../../../src/server/common/path';

describe('server/common/path', () => {
  it('resolves path', () => {
    expect(resolvePath('common', 'path.js')).to.equal(path.resolve(
      __dirname, '..', '..', '..', 'src', 'server', 'common', 'path.js'
    ));
  });
});
