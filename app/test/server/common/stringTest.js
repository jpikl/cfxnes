import {expect} from 'chai';
import {parseBoolean, removePrefix} from '../../../src/server/common/string';

describe('server/common/string', () => {
  it('parses boolean', () => {
    expect(parseBoolean('foo')).to.be.true;
    expect(parseBoolean('true')).to.be.true;
    expect(parseBoolean('1')).to.be.true;
    expect(parseBoolean('false')).to.be.false;
    expect(parseBoolean('0')).to.be.false;
    expect(parseBoolean('')).to.be.false;
    expect(parseBoolean()).to.be.false;
  });

  it('removes prefix', () => {
    expect(removePrefix('foobar', 'bar')).to.equal('foobar');
    expect(removePrefix('foobar', 'foo')).to.equal('bar');
    expect(removePrefix('foobar', 'Foo')).to.equal('foobar');
    expect(removePrefix('foobar', 'Foo', true)).to.equal('bar');
  });
});
