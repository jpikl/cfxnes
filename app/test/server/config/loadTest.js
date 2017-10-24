import path from 'path';
import {expect} from 'chai';
import load from '../../../src/server/config/load';

describe('server/config/load', () => {
  const loadLocal = name => load(path.resolve(__dirname, name));

  it('loads configuration from file', () => {
    expect(loadLocal('data.json')).to.deep.equal({foo: 'bar'});
  });

  it('returns empty configuration when file does not exist', () => {
    expect(loadLocal('missing.json')).to.deep.equal({});
  });

  it('throws error for invalid configuration', () => {
    expect(() => loadLocal('invalid1.json')).to.throw('Invalid configuration');
    expect(() => loadLocal('invalid2.json')).to.throw('Invalid configuration');
  });
});
