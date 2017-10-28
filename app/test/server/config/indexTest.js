import {expect} from 'chai';
import {getConfig, printConfig} from '../../../src/server/config';

describe('server/config', () => {
  it('provides configuration', () => {
    expect(getConfig()).to.be.an('object');
  });

  it('prints configuration', () => {
    const stream = {
      length: 0,
      write(data) { this.length += data.length; },
    };
    printConfig({a: 1}, stream);
    expect(stream.length).to.be.above(0);
  });
});
