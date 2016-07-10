/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Keyboard from '../../../src/input/sources/Keyboard';

describe('input/sources/Keyboard', () => {
  let source, router;

  beforeEach(() => {
    router = {
      routeInput(input, value) {
        this.input = input;
        this.value = value;
        return true;
      },
    };
    source = new Keyboard(router);
    source.activate();
  });

  afterEach(() => {
    source.deactivate();
  });

  it('should generate input for key press when activated', () => {
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.an('object');
  });

  it('should generate input for key release when activated', () => {
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.an('object');
  });

  it('should not generate input for key press when deactivated', () => {
    source.deactivate();
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.undefined;
  });

  it('should not generate input for key release when deactivated', () => {
    source.deactivate();
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(router.input).to.be.undefined;
  });

  it('should generate valid input for key press', () => {
    const input = new KeyboardEvent('keydown');
    Object.defineProperty(input, 'keyCode', {get: () => 13}); // Chrome does not allow to set it in constructor
    dispatchEvent(input);
    expect(router.input.source).to.be.equal('keyboard');
    expect(router.input.name).to.be.equal('enter');
    expect(router.value).to.be.true;
  });

  it('should generate valid input key release', () => {
    const input = new KeyboardEvent('keyup');
    Object.defineProperty(input, 'keyCode', {get: () => 13}); // Chrome does not allow to set it in constructor
    dispatchEvent(input);
    expect(router.input.source).to.be.equal('keyboard');
    expect(router.input.name).to.be.equal('enter');
    expect(router.value).to.be.false;
  });
});
