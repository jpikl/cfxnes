import {expect} from 'chai';
import {getConfig} from '../../../src/server/config';
import defaults from '../../../src/server/config/defaults';

describe('server/config', () => {
  it('provides configuration', () => {
    expect(getConfig()).to.be.an('object').that.deep.equals(defaults);
  });
});
