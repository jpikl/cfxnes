/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Mouse from '../../../src/input/sources/Mouse';

describe('input/sources/Mouse', () => {
  let source, router;

  beforeEach(() => {
    router = {
      routeInput(input, value) {
        this.input = input;
        this.value = value;
        return true;
      },
    };
    source = new Mouse(router);
    source.activate();
  });

  afterEach(() => {
    source.deactivate();
  });

  it('generates input for button press when activated', () => {
    dispatchEvent(new MouseEvent('mousedown'));
    expect(router.input).to.be.an('object');
  });

  it('generates input for button release when activated', () => {
    dispatchEvent(new MouseEvent('mouseup'));
    expect(router.input).to.be.an('object');
  });

  it('generates input for mouse movement when activated', () => {
    dispatchEvent(new MouseEvent('mousemove'));
    expect(router.input).to.be.an('object');
  });

  it('does not generate input for button press when deactivated', () => {
    source.deactivate();
    dispatchEvent(new MouseEvent('mousedown'));
    expect(router.input).to.be.undefined;
  });

  it('does not generate input for button release when deactivated', () => {
    source.deactivate();
    dispatchEvent(new MouseEvent('mouseup'));
    expect(router.input).to.be.undefined;
  });

  it('does not generate input for mouse movement when deactivated', () => {
    source.deactivate();
    dispatchEvent(new MouseEvent('mousemove'));
    expect(router.input).to.be.undefined;
  });

  it('generates valid input for button press', () => {
    dispatchEvent(new MouseEvent('mousedown', {button: 0}));
    expect(router.input.source).to.be.equal('mouse');
    expect(router.input.name).to.be.equal('left');
    expect(router.value).to.be.true;
  });

  it('generates valid input for button release', () => {
    dispatchEvent(new MouseEvent('mouseup', {button: 2}));
    expect(router.input.source).to.be.equal('mouse');
    expect(router.input.name).to.be.equal('right');
    expect(router.value).to.be.false;
  });

  it('generates valid input for mouse movement', () => {
    dispatchEvent(new MouseEvent('mousemove', {clientX: 10, clientY: 20}));
    expect(router.input.source).to.be.equal('mouse');
    expect(router.input.name).to.be.equal('cursor');
    expect(router.value).to.deep.equal([10, 20]);
  });
});
