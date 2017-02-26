import InputMap from '../../src/input/InputMap';
import SourceInput from '../../src/input/SourceInput';
import DeviceInput from '../../src/input/DeviceInput';

describe('input/InputMap', () => {
  let map;

  const mapping = {
    '1.joypad.a': ['keyboard.x', 'keyboard.y'],
    '1.joypad.b': ['keyboard.x', 'keyboard.z'],
  };

  function setMapping() {
    map.set('1.joypad.a', ['keyboard.x', 'keyboard.y']);
    map.set('1.joypad.b', 'keyboard.x');
    map.set('1.joypad.b', 'keyboard.z');
  }

  beforeEach(() => {
    map = new InputMap;
  });

  it('is empty by default', () => {
    expect(map.get()).to.be.deep.equal({});
  });

  it('returns no matches by default', () => {
    expect(map.get('1.joypad.a')).to.deep.equal([]);
  });

  it('throws error when calling get with invalid arguments', () => {
    expect(() => map.get(1)).to.throw('Invalid input: 1');
    expect(() => map.get('a', 'b')).to.throw('Invalid number of arguments: expected 0 or 1 but got 2');
  });

  it('maps 1 to 1 input', () => {
    map.set('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps each input combination only once', () => {
    map.set('1.joypad.a', 'keyboard.x');
    map.set('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps N to M inputs', () => {
    setMapping();
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x', 'keyboard.z']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a', '1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal(['1.joypad.a']);
    expect(map.get('keyboard.z')).to.deep.equal(['1.joypad.b']);
  });

  it('throws error when calling set with invalid arguments', () => {
    expect(() => map.set()).to.throw('Invalid number of arguments: expected 1 or 2 but got 0');
    expect(() => map.set('a', 'b', 'c')).to.throw('Invalid number of arguments: expected 1 or 2 but got 3');
    expect(() => map.set('a')).to.throw('Invalid mapping: "a"');
    expect(() => map.set(1, 'keyboard.x')).to.throw('Invalid device input: 1');
    expect(() => map.set('1.joypad.a', 1)).to.throw('Invalid source input(s): 1');
  });

  it('returns mapping', () => {
    setMapping();
    expect(map.get()).to.deep.equal(mapping);
  });

  it('sets mapping', () => {
    map.set(mapping);
    expect(map.get()).to.deep.equal(mapping);
  });

  it('unmaps one or more inputs', () => {
    setMapping();
    map.delete('1.joypad.a', 'keyboard.z');
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal([]);
  });

  it('unmaps all inputs', () => {
    setMapping();
    map.delete();
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal([]);
    expect(map.get('keyboard.x')).to.deep.equal([]);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal([]);
  });

  it('throws error when unmapping invalid inputs', () => {
    expect(() => map.delete(1)).to.throw('Invalid input: 1');
  });

  it('iterates over input matches', () => {
    setMapping();

    let result = [];
    map.forEach(new DeviceInput(1, 'zapper', 'trigger'), input => result.push(input.toString()));
    expect(result).to.deep.equal([]);

    result = [];
    map.forEach(new DeviceInput(1, 'joypad', 'a'), input => result.push(input.toString()));
    expect(result).to.deep.equal(['keyboard.x', 'keyboard.y']);

    result = [];
    map.forEach(new SourceInput('keyboard', 'z'), input => result.push(input.toString()));
    expect(result).to.deep.equal(['1.joypad.b']);
  });
});
