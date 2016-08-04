/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import InputMapper from '../../src/input/InputMapper';
import SourceInput from '../../src/input/SourceInput';
import DeviceInput from '../../src/input/DeviceInput';

describe('input/InputMapper', () => {
  let mapper;

  const baseMapping = {
    '1.joypad.a': ['keyboard.x', 'keyboard.y'],
    '1.joypad.b': ['keyboard.x', 'keyboard.z'],
  };

  function setBaseMapping() {
    mapper.map('1.joypad.a', ['keyboard.x', 'keyboard.y']);
    mapper.map('1.joypad.b', 'keyboard.x');
    mapper.map('1.joypad.b', 'keyboard.z');
  }

  beforeEach(() => {
    mapper = new InputMapper;
    mapper.unmap();
  });

  it('should return no matches for empty mapping', () => {
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal([]);
  });

  it('throws error when getting matches for invalid input', () => {
    expect(() => mapper.getMatches()).to.throw('Invalid input');
    expect(() => mapper.getMatches(1)).to.throw('Invalid input');
  });

  it('maps 1 to 1 input', () => {
    mapper.map('1.joypad.a', 'keyboard.x');
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(mapper.getMatches('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps each input combination only once', () => {
    mapper.map('1.joypad.a', 'keyboard.x');
    mapper.map('1.joypad.a', 'keyboard.x');
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal(['keyboard.x']);
    expect(mapper.getMatches('keyboard.x')).to.deep.equal(['1.joypad.a']);
  });

  it('maps N to M inputs', () => {
    setBaseMapping();
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
    expect(mapper.getMatches('1.joypad.b')).to.deep.equal(['keyboard.x', 'keyboard.z']);
    expect(mapper.getMatches('keyboard.x')).to.deep.equal(['1.joypad.a', '1.joypad.b']);
    expect(mapper.getMatches('keyboard.y')).to.deep.equal(['1.joypad.a']);
    expect(mapper.getMatches('keyboard.z')).to.deep.equal(['1.joypad.b']);
  });

  it('throws error when mapping invalid inputs', () => {
    expect(() => mapper.map()).to.throw('Invalid device input');
    expect(() => mapper.map(1)).to.throw('Invalid device input');
    expect(() => mapper.map('1.joypad.a')).to.throw('Invalid source input(s)');
    expect(() => mapper.map('1.joypad.a', 1)).to.throw('Invalid source input(s)');
  });

  it('unmaps one or more inputs', () => {
    setBaseMapping();
    mapper.unmap('1.joypad.a', 'keyboard.z');
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal([]);
    expect(mapper.getMatches('1.joypad.b')).to.deep.equal(['keyboard.x']);
    expect(mapper.getMatches('keyboard.x')).to.deep.equal(['1.joypad.b']);
    expect(mapper.getMatches('keyboard.y')).to.deep.equal([]);
    expect(mapper.getMatches('keyboard.z')).to.deep.equal([]);
  });

  it('unmaps all inputs', () => {
    setBaseMapping();
    mapper.unmap();
    expect(mapper.getMatches('1.joypad.a')).to.deep.equal([]);
    expect(mapper.getMatches('1.joypad.b')).to.deep.equal([]);
    expect(mapper.getMatches('keyboard.x')).to.deep.equal([]);
    expect(mapper.getMatches('keyboard.y')).to.deep.equal([]);
    expect(mapper.getMatches('keyboard.z')).to.deep.equal([]);
  });

  it('throws error when unmapping invalid inputs', () => {
    expect(() => mapper.unmap(null)).to.throw('Invalid input');
    expect(() => mapper.unmap(1)).to.throw('Invalid input');
  });

  it('gets mapping', () => {
    setBaseMapping();
    expect(mapper.getMapping()).to.deep.equal(baseMapping);
  });

  it('sets mapping', () => {
    mapper.setMapping(baseMapping);
    expect(mapper.getMapping()).to.deep.equal(baseMapping);
  });

  it('throws error when setting invalid mapping', () => {
    expect(() => mapper.setMapping()).to.throw('Invalid input mapping');
    expect(() => mapper.setMapping(null)).to.throw('Invalid input mapping');
    expect(() => mapper.setMapping('x')).to.throw('Invalid input mapping');
  });

  it('iterates over input matches', () => {
    setBaseMapping();

    let result = [];
    mapper.forEachMatch(new DeviceInput(1, 'zapper', 'trigger'), input => result.push(input.toString()));
    expect(result).to.deep.equal([]);

    result = [];
    mapper.forEachMatch(new DeviceInput(1, 'joypad', 'a'), input => result.push(input.toString()));
    expect(result).to.deep.equal(['keyboard.x', 'keyboard.y']);

    result = [];
    mapper.forEachMatch(new SourceInput('keyboard', 'z'), input => result.push(input.toString()));
    expect(result).to.deep.equal(['1.joypad.b']);
  });
});
