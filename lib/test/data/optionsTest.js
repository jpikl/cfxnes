/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Options from '../../src/data/Options';

describe('data/Options', () => {
  let options, a, b, c1, c2, dx, dy;

  beforeEach(() => {
    a = b = c1 = c2 = dx = dy = undefined;
    options = new Options;
    options.add(['a'], {set(v) { a = v; }, get() { return a; }});
    options.add(['b'], {set(v) { b = v; }, get() { return b; }});
    options.add(['c', 1], {set(v) { c1 = v; }, get() { return c1; }});
    options.add(['c', 2], {set(v) { c2 = v; }, get() { return c2; }});
    options.add(['d', 'x'], {set(v) { dx = v; }, get() { return dx; }});
    options.add(['d', 'y'], {set(v) { dy = v; }, get() { return dy; }});
    localStorage.clear();
  });

  it('returns options', () => {
    a = 'a';
    c1 = 'c1';
    dx = 'dx';
    dy = 'dy';
    expect(options.get()).to.be.deep.equal({a: 'a', c: {1: 'c1'}, d: {x: 'dx', y: 'dy'}});
  });

  it('sets options', () => {
    options.set({a: 'a', c: {1: 'c1'}, d: {x: 'dx', y: 'dy'}});
    expect(a).to.be.equal('a');
    expect(b).to.be.undefined;
    expect(c1).to.be.equal('c1');
    expect(c2).to.be.undefined;
    expect(dx).to.be.equal('dx');
    expect(dy).to.be.equal('dy');
  });

  it('throws error when setting invalid options', () => {
    expect(() => options.set()).to.throw('Invalid options');
    expect(() => options.set(null)).to.throw('Invalid options');
    expect(() => options.set('x')).to.throw('Invalid options');
  });

  it('resets specified options', () => {
    a = b = c1 = c2 = dx = dy = 'v';
    options.reset('a', 'c.1', 'd.x', 'd.y');
    expect(a).to.be.undefined;
    expect(b).to.be.equal('v');
    expect(c1).to.be.undefined;
    expect(c2).to.be.equal('v');
    expect(dx).to.be.undefined;
    expect(dy).to.be.undefined;
  });

  it('resets all options', () => {
    a = b = c1 = c2 = dx = dy = 'v';
    options.reset();
    expect(a).to.be.undefined;
    expect(b).to.be.undefined;
    expect(c1).to.be.undefined;
    expect(c2).to.be.undefined;
    expect(dx).to.be.undefined;
    expect(dy).to.be.undefined;
  });

  it('does not load unsaved options', () => {
    options.load();
    expect(a).to.be.undefined;
    expect(b).to.be.undefined;
    expect(c1).to.be.undefined;
    expect(c2).to.be.undefined;
    expect(dx).to.be.undefined;
    expect(dy).to.be.undefined;
  });

  it('loads saved options', () => {
    a = 'a';
    c1 = 'c1';
    dx = 'dx';
    dy = 'dy';
    options.save();
    a = b = c1 = c2 = dx = dy = undefined;
    options.load();
    expect(a).to.be.equal('a');
    expect(b).to.be.undefined;
    expect(c1).to.be.equal('c1');
    expect(c2).to.be.undefined;
    expect(dx).to.be.equal('dx');
    expect(dy).to.be.equal('dy');
  });

  it('deletes saved options', () => {
    a = 'a';
    c1 = 'c1';
    dx = 'dx';
    dy = 'dy';
    options.save();
    a = b = c1 = c2 = dx = dy = undefined;
    options.delete();
    options.load();
    expect(a).to.be.undefined;
    expect(b).to.be.undefined;
    expect(c1).to.be.undefined;
    expect(c2).to.be.undefined;
    expect(dx).to.be.undefined;
    expect(dy).to.be.undefined;
  });
});
