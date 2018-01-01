import {
  constantProperty,
  computedProperty,
  writableProperty,
  hiddenWritableProperty,
  methodProperty,
  nestedProperty,
  nestedWritableProperty,
} from '../../src/properties/create';

const {defineProperty} = Object;

describe('properties/create', () => {
  const src = {
    get() { return this.value; },
    set(value) { this.value = value; },
    add(value) { return this.value + value; },
    setMap(key, value) { this.map[key] = value; },
    getMap(key) { return this.map[key]; },
  };

  beforeEach(() => {
    src.value = 0;
    src.map = {};
  });

  it('builds constant property', () => {
    const prop = constantProperty(0);
    const obj = defineProperty({}, 'value', prop);

    expect(obj).to.have.ownPropertyDescriptor('value').with.property('enumerable', false);
    expect(obj.value).to.equal(0);
    expect(() => { obj.value = 1; }).to.throw(Error);
  });

  it('builds computed property', () => {
    const prop = computedProperty(src.get, src);
    const obj = defineProperty({}, 'value', prop);

    expect(obj).to.have.ownPropertyDescriptor('value').with.property('enumerable', false);
    expect(obj.value).to.equal(0);
    src.value = 1;
    expect(obj.value).to.equal(1);
    expect(() => { obj.value = 2; }).to.throw(Error);
  });

  it('builds writable property', () => {
    const prop = writableProperty(src.get, src.set, src);
    const obj = defineProperty({}, 'value', prop);

    expect(obj).to.have.ownPropertyDescriptor('value').with.property('enumerable', true);
    expect(obj.value).to.equal(0);
    src.value = 1;
    expect(obj.value).to.equal(1);
    obj.value = 2;
    expect(src.value).to.equal(2);
  });

  it('builds hidden writable property', () => {
    const prop = hiddenWritableProperty(src.get, src.set, src);
    const obj = defineProperty({}, 'value', prop);

    expect(obj).to.have.ownPropertyDescriptor('value').with.property('enumerable', false);
    expect(obj.value).to.equal(0);
    src.value = 1;
    expect(obj.value).to.equal(1);
    obj.value = 2;
    expect(src.value).to.equal(2);
  });

  it('builds method property', () => {
    const prop = methodProperty(src.add, src);
    const obj = defineProperty({}, 'add', prop);

    expect(obj).to.have.ownPropertyDescriptor('add').with.property('enumerable', false);
    src.value = 1;
    expect(obj.add(2)).to.equal(3);
    expect(() => { obj.add = null; }).to.throw(Error);
  });

  it('builds nested properties', () => {
    const prop = nestedProperty({a: {value: 0}, b: {value: 1}});
    const obj = defineProperty({}, 'value', prop);

    expect(obj).to.have.ownPropertyDescriptor('value').with.property('enumerable', true);
    expect(obj.value).to.have.own.property('a');
    expect(obj.value.a).to.equal(0);
    expect(obj.value).to.have.own.property('b');
    expect(obj.value.b).to.equal(1);
  });

  it('builds nested writable properties', () => {
    const keys = ['a', 'b'];
    const prop = nestedWritableProperty(keys, src.getMap, src.setMap, src);
    const {nested} = defineProperty({}, 'nested', prop);

    for (const key of keys) {
      expect(nested).to.have.ownPropertyDescriptor(key).with.property('enumerable', true);
      expect(nested[key]).to.be.undefined;
      src.map[key] = 1;
      expect(nested[key]).to.equal(1);
      nested[key] = 2;
      expect(src.map[key]).to.equal(2);
    }
  });
});
