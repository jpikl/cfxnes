import Keyboard from '../../../src/input/sources/Keyboard';
import {dispatchKeyboardEvent} from '../utils';

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

  it('generates input for key press when activated', () => {
    dispatchKeyboardEvent('keydown');
    expect(router.input).to.be.an('object');
  });

  it('generates input for key release when activated', () => {
    dispatchKeyboardEvent('keydown');
    expect(router.input).to.be.an('object');
  });

  it('does not generate input for key press when deactivated', () => {
    source.deactivate();
    dispatchKeyboardEvent('keydown');
    expect(router.input).to.be.undefined;
  });

  it('does not generate input for key release when deactivated', () => {
    source.deactivate();
    dispatchKeyboardEvent('keyup');
    expect(router.input).to.be.undefined;
  });

  it('generates valid input for key press', () => {
    dispatchKeyboardEvent('keydown', {keyCode: 13});
    expect(router.input.source).to.equal('keyboard');
    expect(router.input.name).to.equal('enter');
    expect(router.value).to.be.true;
  });

  it('generates valid input key release', () => {
    dispatchKeyboardEvent('keyup', {keyCode: 13});
    expect(router.input.source).to.equal('keyboard');
    expect(router.input.name).to.equal('enter');
    expect(router.value).to.be.false;
  });
});
