import Sources from '../../src/input/Sources';
import {SourceInput} from '../../src/input/inputs';
import {dispatchKeyboardEvent, dispatchMouseEvent} from './utils';

describe('input/Sources', () => {
  let sources, router;

  beforeEach(() => {
    router = {
      routeInput(input, value) {
        this.input = input;
        this.value = value;
        return true;
      },
    };
    sources = new Sources(router);
  });

  afterEach(() => {
    sources.setActive(false);
  });

  it('is not active by default', () => {
    expect(sources.isActive()).to.be.false;
  });

  it('changes activity', () => {
    expect(sources.setActive(true));
    expect(sources.isActive()).to.be.true;
    expect(sources.setActive(false));
    expect(sources.isActive()).to.be.false;
  });

  it('does not route input when inactive', () => {
    dispatchKeyboardEvent('keydown');
    expect(router.input).to.be.undefined;
  });

  it('routes input when active', () => {
    sources.setActive(true);
    dispatchKeyboardEvent('keydown');
    expect(router.input).to.be.instanceOf(SourceInput);
  });

  it('does not record inputs by default', () => {
    expect(sources.isRecording()).to.be.false;
  });

  it('starts input recording', () => {
    sources.recordInput(() => {});
    expect(sources.isRecording()).to.be.true;
  });

  it('throws error when callback is not provided for recording', () => {
    expect(() => sources.recordInput()).to.throw('Invalid record input callback: undefined');
    expect(() => sources.recordInput('x')).to.throw('Invalid record input callback: "x"');
  });

  it('does not record input for key press', () => {
    sources.recordInput(() => {});
    dispatchKeyboardEvent('keydown');
    expect(sources.isRecording()).to.be.true;
  });

  it('records input for key release', () => {
    sources.recordInput(() => {});
    dispatchKeyboardEvent('keyup');
    expect(sources.isRecording()).to.be.false;
  });

  it('preserves previous activity during recording', () => {
    sources.setActive(false);
    sources.recordInput(() => {});
    dispatchKeyboardEvent('keyup');
    expect(sources.isActive()).to.be.false;

    sources.setActive(true);
    sources.recordInput(() => {});
    dispatchKeyboardEvent('keyup');
    expect(sources.isActive()).to.be.true;
  });

  it('records input when inactive', () => {
    let recordedInput;
    sources.recordInput(input => { recordedInput = input; });
    dispatchMouseEvent('mouseup', {button: 0});
    expect(recordedInput).to.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });

  it('records input when active', () => {
    let recordedInput;
    sources.setActive(true);
    sources.recordInput(input => { recordedInput = input; });
    dispatchMouseEvent('mouseup', {button: 0});
    expect(recordedInput).to.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });
});
