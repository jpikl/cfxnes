/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import SourceInput from '../../src/input/SourceInput';

describe('input/SourceInput', () => {
  it('should be possible to create', () => {
    const input = new SourceInput('keyboard', 'x');
    expect(input.source).to.be.equal('keyboard');
    expect(input.name).to.be.equal('x');
  });

  it('should be possible to create from valid string', () => {
    const input = SourceInput.fromString('keyboard.x');
    expect(input.source).to.be.equal('keyboard');
    expect(input.name).to.be.equal('x');
  });

  it('should not be possible to create from invalid string', () => {
    expect(SourceInput.fromString('keyboard')).to.be.null;
    expect(SourceInput.fromString('keyboard.x.x')).to.be.null;
  });

  it('should be possible to convert to string', () => {
    expect(new SourceInput('keyboard', 'x').toString()).to.be.equal('keyboard.x');
  });

  it('should equal the same input', () => {
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('keyboard', 'x'))).to.be.true;
  });

  it('should not equal a different input', () => {
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('keyboard', 'y'))).to.be.false;
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('gamepad', 'x'))).to.be.false;
  });
});
