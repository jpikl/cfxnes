import chai from 'chai';
import os from 'os';
import Injector from '../../../../src/lib/core/utils/Injector';

var expect = chai.expect;

describe('Injector', () => {

  it('should throw error for missing dependency', () => {
    expect(() => new Injector({}).get('foo')).to.throw(Error);
  });

  it('should throw error for invalid configuration', () => {
    expect(() => new Injector({foo: {value: 'Foo'}}).get('foo')).to.throw(Error); // Missing type
    expect(() => new Injector({foo: {type: 'invalid', value: 'Foo'}}).get('foo')).to.throw(Error); // Invalid type
    expect(() => new Injector({foo: {type: 'class'}}).get('foo')).to.throw(Error); // Missing class value
    expect(() => new Injector({foo: {type: 'factory'}}).get('foo')).to.throw(Error); // Missing factory value
  });

  it('should resolve value', () => {
    var injector = new Injector({
      missing: {type: 'value'},
      foo: {type: 'value', value: 'Foo'},
    });
    expect(injector.get('missing')).to.be.undefined;
    expect(injector.get('foo')).to.equal('Foo');
  });

  it('should resolve factory value', () => {
    var injector = new Injector({bar: {type: 'factory', value: () => new Bar}});
    expect(injector.get('bar')).to.be.instanceOf(Bar);
  });

  it('should resolve class instance', () => {
    var injector = new Injector({baz: {type: 'class', value: Baz}});
    expect(injector.get('baz')).to.be.instanceOf(Baz);
  });

  it('should resolve always the same value', () => {
    var injector = new Injector({
      foo: {type: 'value', value: 'Foo'},
      bar: {type: 'factory', value: () => new Bar},
      baz: {type: 'class', value: Baz},
    });
    expect(injector.get('foo')).to.be.equal(injector.get('foo'));
    expect(injector.get('bar')).to.be.equal(injector.get('bar'));
    expect(injector.get('baz')).to.be.equal(injector.get('baz'));
  });

  it('should inject dependencies', () => {
    var injector = new Injector({
      foo: {type: 'value', value: 'Foo'},
      bar: {type: 'factory', value: () => new Bar},
      baz: {type: 'class', value: Baz},
    });
    var qux = injector.inject(new Qux);
    expect(qux.foo).to.equal('Foo');
    expect(qux.bar).to.be.instanceOf(Bar);
    expect(qux.baz).to.be.instanceOf(Baz);
  });

  it('should inject circular dependencies', () => {
    var injector = new Injector({
      xyz: {type: 'class', value: Xyz},
      zyx: {type: 'class', value: Zyx},
    });
    var xyz = injector.get('xyz');
    var zyx = injector.get('zyx');
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
