import SourceInput from '../../../src/input/inputs/SourceInput';

describe('input/inputs/SourceInput', () => {
  it('is possible to create', () => {
    const input = new SourceInput('keyboard', 'x');
    expect(input.source).to.equal('keyboard');
    expect(input.name).to.equal('x');
  });

  it('is possible to create from valid string', () => {
    const input = SourceInput.fromString('keyboard.x');
    expect(input.source).to.equal('keyboard');
    expect(input.name).to.equal('x');
  });

  it('is not possible to create from invalid string', () => {
    expect(SourceInput.fromString('keyboard')).to.be.null;
    expect(SourceInput.fromString('keyboard.x.x')).to.be.null;
  });

  it('converts to a string', () => {
    expect(new SourceInput('keyboard', 'x').toString()).to.equal('keyboard.x');
  });

  it('equals the same input', () => {
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('keyboard', 'x'))).to.be.true;
  });

  it('does not equal a different input', () => {
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('keyboard', 'y'))).to.be.false;
    expect(new SourceInput('keyboard', 'x').equals(new SourceInput('gamepad', 'x'))).to.be.false;
  });
});
