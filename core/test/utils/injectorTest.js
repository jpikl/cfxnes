/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import chai from 'chai';
import Injector from '../../src/utils/Injector';

const expect = chai.expect;

describe('Injector', () => {
  it('should throw error for missing dependency', () => {
    expect(() => new Injector({}).get('foo')).to.throw(Error);
  });

  it('should throw error for invalid configuration', () => {
    expect(() => new Injector({foo: {}}).get('foo')).to.throw(Error); // No class, factory or value
    expect(() => new Injector({foo: {class: false}}).get('foo')).to.throw(Error); // Class is not a function
    expect(() => new Injector({foo: {factory: false}}).get('foo')).to.throw(Error); // Factory is not a function
  });

  it('should resolve value', () => {
    const injector = new Injector({
      nil: {value: null},
      foo: {value: 'Foo'},
    });
    expect(injector.get('nil')).to.be.null;
    expect(injector.get('foo')).to.equal('Foo');
  });

  it('should resolve factory value', () => {
    const injector = new Injector({bar: {factory: () => new Bar}});
    expect(injector.get('bar')).to.be.instanceOf(Bar);
  });

  it('should resolve class instance', () => {
    const injector = new Injector({baz: {class: Baz}});
    expect(injector.get('baz')).to.be.instanceOf(Baz);
  });

  it('should resolve always the same value', () => {
    const injector = new Injector({
      foo: {value: 'Foo'},
      bar: {factory: () => new Bar},
      baz: {class: Baz},
    });
    expect(injector.get('foo')).to.be.equal(injector.get('foo'));
    expect(injector.get('bar')).to.be.equal(injector.get('bar'));
    expect(injector.get('baz')).to.be.equal(injector.get('baz'));
  });

  it('should inject dependencies', () => {
    const injector = new Injector({
      foo: {value: 'Foo'},
      bar: {factory: () => new Bar},
      baz: {class: Baz},
    });
    const qux = injector.inject(new Qux);
    expect(qux.foo).to.equal('Foo');
    expect(qux.bar).to.be.instanceOf(Bar);
    expect(qux.baz).to.be.instanceOf(Baz);
  });

  it('should inject circular dependencies', () => {
    const injector = new Injector({
      xyz: {class: Xyz},
      zyx: {class: Zyx},
    });
    const xyz = injector.get('xyz');
    const zyx = injector.get('zyx');
    expect(xyz).to.be.instanceOf(Xyz);
    expect(zyx).to.be.instanceOf(Zyx);
    expect(xyz.zyx).to.be.equal(zyx);
    expect(zyx.xyz).to.be.equal(xyz);
  });
});

class Bar {
}

class Baz {
}

class Qux {

  constructor() {
    this.dependencies = ['foo', 'bar', 'baz'];
  }

  inject(foo, bar, baz) {
    this.foo = foo;
    this.bar = bar;
    this.baz = baz;
  }

}

class Xyz {

  constructor() {
    this.dependencies = ['zyx'];
  }

  inject(zyx) {
    this.zyx = zyx;
  }

}

class Zyx {

  constructor() {
    this.dependencies = ['xyz'];
  }

  inject(xyz) {
    this.xyz = xyz;
  }

}
