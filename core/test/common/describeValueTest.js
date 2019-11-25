import {describe, it} from 'mocha';
import {expect} from 'chai';
import describeValue from '../../src/common/describeValue';

describe('common/describe', () => {
  it('describes undefined', () => {
    expect(describeValue(undefined)).to.equal('undefined');
  });

  it('describes null', () => {
    expect(describeValue(null)).to.equal('null');
  });

  it('describes number', () => {
    expect(describeValue(123)).to.equal('123');
  });

  it('describes string', () => {
    expect(describeValue('abc')).to.equal('"abc"');
  });

  it('describes string that is too long', () => {
    expect(describeValue('a'.repeat(100))).to.equal(`"${'a'.repeat(80)}..."`);
  });

  it('describes anonymous function', () => {
    expect(describeValue(() => {})).to.equal('Function');
  });

  it('describes named function', () => {
    expect(describeValue(function foo() {})).to.equal('Function(foo)'); // eslint-disable-line prefer-arrow-callback
  });

  it('describes object', () => {
    expect(describeValue({})).to.equal('Object');
  });

  it('describes array', () => {
    expect(describeValue([1, 2, 3])).to.equal('Array(3)');
  });

  it('describes typed array', () => {
    expect(describeValue(Uint8Array.of(1, 2, 3))).to.equal('Uint8Array(3)');
  });

  it('describes symbol', () => {
    expect(describeValue(Symbol('bar'))).to.equal('Symbol(bar)');
  });
});
