import chai from 'chai';
import * as objects from '../../../../src/lib/core/utils/objects';

var expect = chai.expect;

describe('Objects utils', () => {

  it('can copy object', () => {
    var obj = {a: {b: 1}};
    expect(objects.copyObject(obj)).not.to.equal(obj);
    expect(objects.copyObject(obj)).to.deep.equal(obj);
  });

  it('can get property recursively', () => {
    var obj = {a: {b: 1}};
    expect(objects.getProperty(undefined)).to.be.undefined;
    expect(objects.getProperty(obj)).to.equal(obj);
    expect(objects.getProperty(obj, 'a')).to.equal(obj.a);
    expect(objects.getProperty(obj, 'a', 'b')).to.equal(obj.a.b);
  });

  it('can set property recursively', () => {
    var obj;
    expect(() => objects.setProperty(undefined)).to.throw(Error);
    expect(() => objects.setProperty(obj)).to.throw(Error);
    expect(() => objects.setProperty(obj, 'a')).to.throw(Error);
    expect(objects.setProperty(obj = {}, 'a', 1)).to.be.equal(obj);
    expect(objects.setProperty({}, 'a', 1)).to.deep.equal({a: 1});
    expect(objects.setProperty({}, 'a', 'b', 1)).to.deep.equal({a: {b: 1}});
  });

  it('can iterate properties', () => {
    var mapper = {
      a: 1,
      b: 2,
      copy(value) {
        dst2[value] = this[value];
      },
    };
    var dst1 = {};
    var dst2 = {};
    objects.forEachProperty({a: 1, b: 2}, value => dst1[value] = mapper[value]);
    objects.forEachProperty({a: 1, b: 2}, mapper.copy, mapper);
    expect(dst1).to.deep.equal({a: 1, b: 2});
    expect(dst2).to.deep.equal({a: 1, b: 2});
  });

  it('can copy properties', () => {
    var obj;
    expect(objects.copyProperties(obj = {})).not.to.equal(obj);
    expect(objects.copyProperties({}, obj = {})).to.equal(obj);
    expect(objects.copyProperties({a: 1, b: 2})).to.deep.equal({a: 1, b: 2});
    expect(objects.copyProperties({a: 1, b: 2}, {})).to.deep.equal({a: 1, b: 2});
  });

  it('can merge properties', () => {
    var obj;
    expect(objects.mergeProperties(obj = {}, {})).not.to.equal(obj);
    expect(objects.mergeProperties({}, obj = {})).not.to.equal(obj);
    expect(objects.mergeProperties({a: 1}, {b: 2})).not.to.equal({a: 1, b: 2});
  });

  it('can make enumeration', () => {
    var enumeration = objects.makeEnumeration({a: 1, b: {id: 'x'}, c: {name: 'y'}, d: {id: 'z', name: 'w'}});
    expect(enumeration.a).to.equal('a');
    expect(enumeration.getParams(enumeration.a)).to.equal(1);
    expect(enumeration.toString(enumeration.a)).to.equal('a');
    expect(enumeration.b).to.equal('x');
    expect(enumeration.getParams(enumeration.b)).to.deep.equal({id: 'x'});
    expect(enumeration.toString(enumeration.b)).to.equal('x');
    expect(enumeration.c).to.equal('c');
    expect(enumeration.getParams(enumeration.c)).to.deep.equal({name: 'y'});
    expect(enumeration.toString(enumeration.c)).to.equal('y');
    expect(enumeration.d).to.equal('z');
    expect(enumeration.getParams(enumeration.d)).to.deep.equal({id: 'z', name: 'w'});
    expect(enumeration.toString(enumeration.d)).to.equal('w');
  });

});
