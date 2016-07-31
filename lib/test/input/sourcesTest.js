/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Sources from '../../src/input/Sources';
import SourceInput from '../../src/input/SourceInput';

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

  it('sets/gets activity', () => {
    expect(sources.setActive(true));
    expect(sources.isActive()).to.be.true;
    expect(sources.setActive(false));
    expect(sources.isActive()).to.be.false;
  });

  it('does not route input when inactive', () => {
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.undefined;
  });

  it('routes input when active', () => {
    sources.setActive(true);
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.instanceof(SourceInput);
  });

  it('does not record inputs by default', () => {
    expect(sources.isRecording()).to.be.false;
  });

  it('starts input recording', () => {
    sources.recordInput(() => {});
    expect(sources.isRecording()).to.be.true;
  });

  it('does not record input for key press', () => {
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(sources.isRecording()).to.be.true;
  });

  it('records input for key release', () => {
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isRecording()).to.be.false;
  });

  it('preserves previous activity during recording', () => {
    sources.setActive(false);
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isActive()).to.be.false;

    sources.setActive(true);
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isActive()).to.be.true;
  });

  it('records input when inactive', () => {
    let recordedInput;
    sources.recordInput(input => { recordedInput = input; });
    dispatchEvent(new MouseEvent('mouseup', {button: 0}));
    expect(recordedInput).to.be.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });

  it('records input when active', () => {
    let recordedInput;
    sources.setActive(true);
    sources.recordInput(input => { recordedInput = input; });
    dispatchEvent(new MouseEvent('mouseup', {button: 0}));
    expect(recordedInput).to.be.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });
});
