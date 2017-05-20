import {DeviceInput, SourceInput} from '../../../src/input/inputs';
import parseInput from '../../../src/input/inputs/parse';

describe('input/inputs/parse', () => {
  it('parses source input string', () => {
    expect(parseInput('keyboard.x')).to.be.an.instanceof(SourceInput);
    expect(parseInput('mouse.x')).to.be.an.instanceof(SourceInput);
    expect(parseInput('gamepad0.x')).to.be.an.instanceof(SourceInput);
  });

  it('parses source input string (typed)', () => {
    expect(parseInput('keyboard.x', SourceInput)).to.be.an.instanceof(SourceInput);
    expect(parseInput('mouse.x', SourceInput)).to.be.an.instanceof(SourceInput);
    expect(parseInput('gamepad0.x', SourceInput)).to.be.an.instanceof(SourceInput);
  });

  it('parses device input string', () => {
    expect(parseInput('1.joypad.a')).to.be.an.instanceof(DeviceInput);
    expect(parseInput('2.zapper.trigger')).to.be.an.instanceof(DeviceInput);
  });

  it('parses device input string (type)', () => {
    expect(parseInput('1.joypad.a', DeviceInput)).to.be.an.instanceof(DeviceInput);
    expect(parseInput('2.zapper.trigger', DeviceInput)).to.be.an.instanceof(DeviceInput);
  });

  it('throws error for invalid input string', () => {
    expect(() => parseInput()).to.throw('Invalid input: undefined');
    expect(() => parseInput(1)).to.throw('Invalid input: 1');
    expect(() => parseInput('x')).to.throw('Invalid input: "x"');
    expect(() => parseInput('x.x.x.x')).to.throw('Invalid input: "x.x.x.x"');
  });

  it('throws error for invalid input string (typed)', () => {
    expect(() => parseInput('keyboard.x', DeviceInput)).to.throw('Invalid device input: "keyboard.x"');
    expect(() => parseInput('1.joypad.a', SourceInput)).to.throw('Invalid source input: "1.joypad.a"');
  });

  it('throws error for invalid source input string', () => {
    expect(() => parseInput('x.x')).to.throw('Invalid input source: "x"');
    expect(() => parseInput('keyboard0.x')).to.throw('Invalid input source: "keyboard0"');
    expect(() => parseInput('mouse0.x')).to.throw('Invalid input source: "mouse0"');
    expect(() => parseInput('gamepad.x')).to.throw('Invalid input source: "gamepad"');
  });

  it('throws error for invalid device input string', () => {
    expect(() => parseInput('x.joypad.a')).to.throw('Invalid input port: "x"');
    expect(() => parseInput('0.joypad.a')).to.throw('Invalid input port: 0');
    expect(() => parseInput('3.joypad.a')).to.throw('Invalid input port: 3');
    expect(() => parseInput('1.x.a')).to.throw('Invalid input device: "x"');
  });
});
