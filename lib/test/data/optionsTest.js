/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import Options from '../../src/data/Options';

describe('data/Options', () => {
  let target, options;

  before(() => {
    target = {
      setNumber(number) {
        this.number = number;
      },
      getNumber() {
        return this.number;
      },
      setText(text) {
        this.text = text;
      },
      getText() {
        return this.text;
      },
    };
    options = new Options(target);
    options.add('number', target.setNumber, target.getNumber, 1);
    options.add('text', target.setText, target.getText, 'a');
  });

  beforeEach(() => {
    setValues(0, null);
    localStorage.clear();
  });

  it('gets options', () => {
    expect(options.get()).to.be.deep.equal({number: 0, text: null});
  });

  it('sets options', () => {
    options.set({number: 2});
    expectValues(2, null);
  });

  it('resets specified options', () => {
    options.reset('number');
    expectValues(1, null);
  });

  it('resets all options', () => {
    options.reset();
    expectValues(1, 'a');
  });

  it('does not load unsaved options', () => {
    options.load();
    expectValues(0, null);
  });

  it('loads saved options', () => {
    setValues(2, 'b');
    options.save();
    setValues(0, null);
    options.load();
    expectValues(2, 'b');
  });

  it('deletes saved options', () => {
    setValues(2, 'b');
    options.save();
    setValues(0, null);
    options.delete();
    options.load();
    expectValues(0, null);
  });

  it('merges options of various holders', () => {
    const target1 = {set(value) { this.value = value; }, get() { return this.value; }};
    const target2 = {set(value) { this.value = value; }, get() { return this.value; }};
    target1.options = new Options(target1);
    target1.options.add('value1', target1.set, target1.get, 1);
    target2.options = new Options(target2);
    target2.options.add('value1', target2.set, target2.get, 2);
    Options.of(target1, target2).reset();
    expect(target1.value).to.be.equal(1);
    expect(target2.value).to.be.equal(2);
  });

  function setValues(number, text) {
    target.number = number;
    target.text = text;
  }

  function expectValues(number, text) {
    expect(target.number).to.be.equal(number);
    expect(target.text).to.be.equal(text);
  }
});
