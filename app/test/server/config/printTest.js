import {expect} from 'chai';
import print from '../../../src/server/config/print';

describe('server/config/print', () => {
  it('prints configuration', () => {
    const stream = {
      length: 0,
      write(data) { this.length += data.length; },
    };
    print({a: 1}, stream);
    expect(stream.length).to.be.above(0);
  });
});
