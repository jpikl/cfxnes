import chai from 'chai';
import {makeEnum} from '../../src/utils/enum';

var expect = chai.expect;

describe('Enum utils', () => {

  it('can make simple enum', () => {
    var e = makeEnum({a: 1, b: 2});
    expect(e.a).to.equal(1);
    expect(e.b).to.equal(2);
    expect(e.toString(e.a)).to.equal('1');
    expect(e.toString(e.b)).to.equal('2');
    expect(e.getParams(e.a)).to.deep.equal({});
    expect(e.getParams(e.b)).to.deep.equal({});
  });

  it('can make structured enum', () => {
    var e = makeEnum({a: {}, b: {value: 'b-value'}});
    expect(e.a).to.equal('a');
    expect(e.b).to.equal('b');
    expect(e.toString(e.a)).to.equal('a');
    expect(e.toString(e.b)).to.equal('b');
    expect(e.getParams(e.a)).to.deep.equal({});
    expect(e.getParams(e.b)).to.deep.equal({value: 'b-value'});
  });

  it('can make structured enum with custom ID', () => {
    var e = makeEnum({a: {}, b: {id: 'b-id'}});
    expect(e.a).to.equal('a');
    expect(e.b).to.equal('b-id');
    expect(e.toString(e.a)).to.equal('a');
    expect(e.toString(e.b)).to.equal('b-id');
    expect(e.getParams(e.a)).to.deep.equal({});
    expect(e.getParams(e.b)).to.deep.equal({id: 'b-id'});
  });

  it('can make structured enum with custom name', () => {
    var e = makeEnum({a: {}, b: {id: 'b-id'}, c: {name: 'c-name'}, d: {id: 'd-id', name: 'd-name'}});
    expect(e.a).to.equal('a');
    expect(e.b).to.equal('b-id');
    expect(e.c).to.equal('c');
    expect(e.d).to.equal('d-id');
    expect(e.toString(e.a)).to.equal('a');
    expect(e.toString(e.b)).to.equal('b-id');
    expect(e.toString(e.c)).to.equal('c-name');
    expect(e.toString(e.d)).to.equal('d-name');
    expect(e.getParams(e.a)).to.deep.equal({});
    expect(e.getParams(e.b)).to.deep.equal({id: 'b-id'});
    expect(e.getParams(e.c)).to.deep.equal({name: 'c-name'});
    expect(e.getParams(e.d)).to.deep.equal({id: 'd-id', name: 'd-name'});
  });

});
