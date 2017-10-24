import {expect} from 'chai';
import {getConfig} from '../../../src/server/config';

describe('server/config', () => {
  it('provides configuration', () => {
    expect(getConfig()).to.be.an('object');
  });
});
