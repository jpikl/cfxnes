import {expect} from 'chai';
import {debounce} from '../../src/common/utils';
import {asyncCall} from '../utils';

describe('common/utils', () => {
  it('debounces function call', done => {
    let counter = 0;
    const increment = () => { counter++; };
    const debouncedIncrement = debounce(increment, 10);

    debouncedIncrement();
    expect(counter).to.equal(0);

    asyncCall(done, 5, () => {
      debouncedIncrement();
      expect(counter).to.equal(0);

      asyncCall(done, 20, () => {
        expect(counter).to.equal(1);
        done();
      });
    });
  });
});
