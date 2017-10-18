import {expect} from 'chai';
import {debounce} from '../../src/common/utils';

describe('common/utils', () => {
  it('debounces function call', done => {
    let counter = 0;
    const increment = () => { counter++; };
    const debouncedIncrement = debounce(increment, 10);

    debouncedIncrement();
    expect(counter).to.be.equal(0);

    setTimeout(() => {
      try {
        debouncedIncrement();
        expect(counter).to.be.equal(0);

        setTimeout(() => {
          try {
            expect(counter).to.be.equal(1);
            done();
          } catch (error) {
            done(error);
          }
        }, 20);
      } catch (error) {
        done(error);
      }
    }, 5);
  })
});
