/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import InputMap from '../../src/input/InputMap';
import SourceInput from '../../src/input/SourceInput';
import DeviceInput from '../../src/input/DeviceInput';

describe('input/InputMap', () => {
  let map;

  const baseMapping = {
    '1.joypad.a': ['keyboard.x', 'keyboard.y'],
    '1.joypad.b': ['keyboard.x', 'keyboard.z'],
  };

  function setBaseMapping() {
    map.put('1.joypad.a', ['keyboard.x', 'keyboard.y']);
    map.put('1.joypad.b', 'keyboard.x');
    map.put('1.joypad.b', 'keyboard.z');
  }

  beforeEach(() => {
    map = new InputMap;
    map.clear();
  });

  it('should return no matches for empty mapping', () => {
    expect(map.get('1.joypad.a')).to.deep.equal([]);
  });

  it('throws error when getting matches for invalid input', () => {
    expect(() => map.get()).to.throw('Invalid input');
    expect(() => map.get(1)).to.throw('Invalid input');
  });

  it('maps 1 to 1 input', () => {
    map.put('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps each input combination only once', () => {
    map.put('1.joypad.a', 'keyboard.x');
    map.put('1.joypad.a', 'keyboard.x');
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps N to M inputs', () => {
    setBaseMapping();
    expect(map.get('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x', 'keyboard.z']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.a', '1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal(['1.joypad.a']);
    expect(map.get('keyboard.z')).to.deep.equal(['1.joypad.b']);
  });

  it('throws error when mapping invalid inputs', () => {
    expect(() => map.put()).to.throw('Invalid device input');
    expect(() => map.put(1)).to.throw('Invalid device input');
    expect(() => map.put('1.joypad.a')).to.throw('Invalid source input(s)');
    expect(() => map.put('1.joypad.a', 1)).to.throw('Invalid source input(s)');
  });

  it('unmaps one or more inputs', () => {
    setBaseMapping();
    map.removeAll('1.joypad.a', 'keyboard.z');
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal(['keyboard.x']);
    expect(map.get('keyboard.x')).to.deep.equal(['1.joypad.b']);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal([]);
  });

  it('unmaps all inputs', () => {
    setBaseMapping();
    map.removeAll();
    expect(map.get('1.joypad.a')).to.deep.equal([]);
    expect(map.get('1.joypad.b')).to.deep.equal([]);
    expect(map.get('keyboard.x')).to.deep.equal([]);
    expect(map.get('keyboard.y')).to.deep.equal([]);
    expect(map.get('keyboard.z')).to.deep.equal([]);
  });

  it('throws error when unmapping invalid inputs', () => {
    expect(() => map.removeAll(null)).to.throw('Invalid input');
    expect(() => map.removeAll(1)).to.throw('Invalid input');
  });

  it('returns mapping', () => {
    setBaseMapping();
    expect(map.getAll()).to.deep.equal(baseMapping);
  });

  it('sets mapping', () => {
    map.setAll(baseMapping);
    expect(map.getAll()).to.deep.equal(baseMapping);
  });

  it('throws error when setting invalid mapping', () => {
    expect(() => map.setAll()).to.throw('Invalid inputs');
    expect(() => map.setAll(null)).to.throw('Invalid inputs');
    expect(() => map.setAll('x')).to.throw('Invalid inputs');
  });

  it('iterates over input matches', () => {
    setBaseMapping();

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
