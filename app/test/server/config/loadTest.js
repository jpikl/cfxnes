import {expect} from 'chai';
import load from '../../../src/server/config/load';
import {NON_EXISTENT_PATH, INVALID_JSON_PATH, STRING_JSON_PATH, OBJECT_JSON_PATH} from '../fixtures';

describe('server/config/load', () => {
  it('loads configuration from file', () => {
    expect(load(OBJECT_JSON_PATH)).to.deep.equal({foo: 'bar'});
  });

  it('returns empty configuration when file does not exist', () => {
    expect(load(NON_EXISTENT_PATH)).to.deep.equal({});
  });

  it('throws error for invalid configuration', () => {
    expect(() => load(INVALID_JSON_PATH)).to.throw('Invalid configuration');
    expect(() => load(STRING_JSON_PATH)).to.throw('Invalid configuration');
  });
});
