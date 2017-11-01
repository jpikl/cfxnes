import Mouse from '../../../src/input/sources/Mouse';
import {dispatchMouseEvent} from '../utils';

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
    dispatchMouseEvent('mousedown');
    expect(router.input).to.be.an('object');
  });

  it('generates input for button release when activated', () => {
    dispatchMouseEvent('mouseup');
    expect(router.input).to.be.an('object');
  });

  it('generates input for mouse movement when activated', () => {
    dispatchMouseEvent('mousemove');
    expect(router.input).to.be.an('object');
  });

  it('does not generate input for button press when deactivated', () => {
    source.deactivate();
    dispatchMouseEvent('mousedown');
    expect(router.input).to.be.undefined;
  });

  it('does not generate input for button release when deactivated', () => {
    source.deactivate();
    dispatchMouseEvent('mouseup');
    expect(router.input).to.be.undefined;
  });

  it('does not generate input for mouse movement when deactivated', () => {
    source.deactivate();
    dispatchMouseEvent('mousemove');
    expect(router.input).to.be.undefined;
  });

  it('generates valid input for button press', () => {
    dispatchMouseEvent('mousedown', {button: 0});
    expect(router.input.source).to.equal('mouse');
    expect(router.input.name).to.equal('left');
    expect(router.value).to.be.true;
  });

  it('generates valid input for button release', () => {
    dispatchMouseEvent('mouseup', {button: 2});
    expect(router.input.source).to.equal('mouse');
    expect(router.input.name).to.equal('right');
    expect(router.value).to.be.false;
  });

  it('generates valid input for mouse movement', () => {
    dispatchMouseEvent('mousemove', {clientX: 10, clientY: 20});
    expect(router.input.source).to.equal('mouse');
    expect(router.input.name).to.equal('cursor');
    expect(router.value).to.deep.equal([10, 20]);
  });
});
