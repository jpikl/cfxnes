import {SourceInput, DeviceInput} from '../../src/input/inputs';
import InputMap from '../../src/input/InputMap';

describe('input/InputMap', () => {
  let map;

  const mapping = {
    '1.joypad.a': ['keyboard.x', 'keyboard.y'],
    '1.joypad.b': ['keyboard.x', 'keyboard.z'],
  };

  function setMapping() {
    map.set('1.joypad.a', 'keyboard.x');
    map.set('1.joypad.a', 'keyboard.y');
    map.set('1.joypad.b', 'keyboard.x');
    map.set('1.joypad.b', 'keyboard.z');
  }

  beforeEach(() => {
    map = new InputMap;
  });

  it('returns no mappings for any input by default', () => {
    expect(map.get('1.joypad.a')).to.deep.equal([]);
  });

  it('throws error when returning mapping for invalid input', () => {
    expect(() => map.get(1)).to.throw('Invalid input: 1');
  });

  it('sets mapping between 2 inputs', () => {
    map.set('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('sets mapping between multiple inputs', () => {
    setMapping();
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x', 'keyboard.z']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a', '1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal(['1.joypad.a']);
    expect(map.get('keyboard.z')).to.deep.equal(['1.joypad.b']);
  });

  it('maps each input combination only once', () => {
    map.set('1.joypad.a', 'keyboard.x');
    map.set('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('throws error when setting mapping for invalid input', () => {
    expect(() => map.set(null, 'keyboard.x')).to.throw('Invalid device input: null');
    expect(() => map.set('1.joypad.a', null)).to.throw('Invalid source input: null');
  });

  it('deletes mapping for a specific input', () => {
    setMapping();
    map.delete('1.joypad.a');
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x', 'keyboard.z']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal(['1.joypad.b']);
    map.delete('keyboard.z');
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal([]);
  });

  it('throws error when deleting mapping for invalid input', () => {
    expect(() => map.delete(1)).to.throw('Invalid input: 1');
  });

  it('contains no input mappings by default', () => {
    expect(map.getAll()).to.deep.equal({});
  });

  it('returns mapping for all inputs', () => {
    setMapping();
    expect(map.getAll()).to.deep.equal(mapping);
  });

  it('sets mapping for all inputs', () => {
    map.setAll(mapping);
    expect(map.getAll()).to.deep.equal(mapping);
  });

  it('throws error when setting invalid mapping for all inputs', () => {
    expect(() => map.setAll()).to.throw('Invalid mapping: undefined');
    expect(() => map.setAll({'x': 'keyboard.x'})).to.throw('Invalid device input: "x"');
    expect(() => map.setAll({'1.joypad.a': null})).to.throw('Invalid source input(s): null');
  });

  it('deletes mapping for all inputs', () => {
    setMapping();
    map.deleteAll();
    expect(map.getAll()).to.deep.equal({});
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
