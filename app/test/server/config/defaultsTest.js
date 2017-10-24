import {expect} from 'chai';
import defaults from '../../../src/server/config/defaults';

describe('server/config/defaults', () => {
  it('contains default values', () => {
    expect(defaults).to.be.an('object');
  });
});
