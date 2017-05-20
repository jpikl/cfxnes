import DeviceInput from '../../../src/input/inputs/DeviceInput';

describe('input/inputs/DeviceInput', () => {
  it('is possible to create', () => {
    const input = new DeviceInput(1, 'joypad', 'a');
    expect(input.port).to.be.equal(1);
    expect(input.device).to.be.equal('joypad');
    expect(input.name).to.be.equal('a');
  });

  it('is possible to create from valid string', () => {
    const input = DeviceInput.fromString('1.joypad.a');
    expect(input.port).to.be.equal(1);
    expect(input.device).to.be.equal('joypad');
    expect(input.name).to.be.equal('a');
  });

  it('is not possible to create from invalid string', () => {
    expect(DeviceInput.fromString('1.joypad')).to.be.null;
    expect(DeviceInput.fromString('1.joypad.a.a')).to.be.null;
  });

  it('converts to a string', () => {
    expect(new DeviceInput(1, 'joypad', 'a').toString()).to.be.equal('1.joypad.a');
  });

  it('equals the same input', () => {
    expect(new DeviceInput(1, 'joypad', 'a').equals(new DeviceInput(1, 'joypad', 'a'))).to.be.true;
  });

  it('does not equal a different input', () => {
    expect(new DeviceInput(1, 'joypad', 'a').equals(new DeviceInput(2, 'joypad', 'a'))).to.be.false;
    expect(new DeviceInput(1, 'joypad', 'a').equals(new DeviceInput(1, 'zapper', 'a'))).to.be.false;
    expect(new DeviceInput(1, 'joypad', 'a').equals(new DeviceInput(1, 'joypad', 'b'))).to.be.false;
  });
});
