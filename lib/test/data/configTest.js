/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Config from '../../src/data/Config';

describe('data/Config', () => {
  let config, a, b, c1, c2, dx, dy;

  beforeEach(() => {
    a = b = c1 = c2 = dx = dy = undefined;
    config = new Config;
    config.add(['a'], {set(v) { a = v; }, get() { return a; }});
    config.add(['b'], {set(v) { b = v; }, get() { return b; }});
    config.add(['c', 1], {set(v) { c1 = v; }, get() { return c1; }});
    config.add(['c', 2], {set(v) { c2 = v; }, get() { return c2; }});
    config.add(['d', 'x'], {set(v) { dx = v; }, get() { return dx; }});
    config.add(['d', 'y'], {set(v) { dy = v; }, get() { return dy; }});
  });

  it('returns configuration', () => {
    a = 'a';
    c1 = 'c1';
    dx = 'dx';
    dy = 'dy';
    expect(config.get()).to.be.deep.equal({a: 'a', c: {1: 'c1'}, d: {x: 'dx', y: 'dy'}});
  });

  it('sets configuration', () => {
    config.set({a: 'a', c: {1: 'c1'}, d: {x: 'dx', y: 'dy'}});
    expect(a).to.be.equal('a');
    expect(b).to.be.undefined;
    expect(c1).to.be.equal('c1');
    expect(c2).to.be.undefined;
    expect(dx).to.be.equal('dx');
    expect(dy).to.be.equal('dy');
  });

  it('throws error when setting invalid configuration', () => {
    expect(() => config.set()).to.throw('Invalid configuration');
    expect(() => config.set(null)).to.throw('Invalid configuration');
    expect(() => config.set('x')).to.throw('Invalid configuration');
  });
});
