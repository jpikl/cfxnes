import {expect} from 'chai';
import merge from '../../../src/server/config/merge';

describe('server/config/merge', () => {
  it('merges values', () => {
    const env = {
      BOOLEAN_VALUE_X: 'true',
      NUMBER_VALUE_X: 2,
      STRING_VALUE_X: 'c',
    };

    const values = {
      booleanValueX: false,
      booleanValueY: true,
      numberValueX: 0,
      numberValueY: 1,
      stringValueX: 'a',
      stringValueY: 'b',
    };

    const defaults = {
      booleanValueX: false,
      booleanValueY: false,
      booleanValueZ: false,
      numberValueX: 0,
      numberValueY: 0,
      numberValueZ: 0,
      stringValueX: 'a',
      stringValueY: 'a',
      stringValueZ: 'a',
    };

    const result = merge(env, values, defaults);

    expect(result.booleanValueX).to.be.true;
    expect(result.booleanValueY).to.be.true;
    expect(result.booleanValueZ).to.be.false;

    expect(result.numberValueX).to.equal(2);
    expect(result.numberValueY).to.equal(1);
    expect(result.numberValueZ).to.equal(0);

    expect(result.stringValueX).to.equal('c');
    expect(result.stringValueY).to.equal('b');
    expect(result.stringValueZ).to.equal('a');
  });
});
