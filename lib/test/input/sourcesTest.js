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

  it('should be inactive by default', () => {
    expect(sources.isActive()).to.be.false;
  });

  it('should be possible to set active/inactive', () => {
    expect(sources.setActive(true));
    expect(sources.isActive()).to.be.true;
    expect(sources.setActive(false));
    expect(sources.isActive()).to.be.false;
  });

  it('should not route input when inactive', () => {
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.undefined;
  });

  it('should route input when active', () => {
    sources.setActive(true);
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(router.input).to.be.instanceof(SourceInput);
  });

  it('should not be recording by default', () => {
    expect(sources.isRecording()).to.be.false;
  });

  it('should allow to start recording', () => {
    sources.recordInput(() => {});
    expect(sources.isRecording()).to.be.true;
  });

  it('should not record input for key press', () => {
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keydown'));
    expect(sources.isRecording()).to.be.true;
  });

  it('should record input for key release', () => {
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isRecording()).to.be.false;
  });

  it('should preserve previous activity during recording', () => {
    sources.setActive(false);
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isActive(false));

    sources.setActive(true);
    sources.recordInput(() => {});
    dispatchEvent(new KeyboardEvent('keyup'));
    expect(sources.isActive(true));
  });

  it('should record input when inactive', () => {
    let recordedInput;
    sources.recordInput(input => { recordedInput = input; });
    dispatchEvent(new MouseEvent('mouseup', {button: 0}));
    expect(recordedInput).to.be.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });

  it('should record input when active', () => {
    let recordedInput;
    sources.setActive(true);
    sources.recordInput(input => { recordedInput = input; });
    dispatchEvent(new MouseEvent('mouseup', {button: 0}));
    expect(recordedInput).to.be.equal('mouse.left');
    expect(router.input).to.be.undefined;
  });
});
