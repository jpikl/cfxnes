import writeProps from '../../src/props/write';

describe('props/write', () => {
  it('writes values to properties', () => {
    const props = Object.defineProperties({}, {
      constant: {value: -1, writable: false, enumerable: true},
      writable: {value: -2, writable: true, enumerable: true},
      hidden: {value: -3, writable: true, enumerable: false},
      unchanged: {value: -4, writable: true, enumerable: true},
      nested: {
        value: Object.defineProperties({}, {
          constant: {value: -5, writable: false, enumerable: true},
          writable: {value: -6, writable: true, enumerable: true},
          hidden: {value: -7, writable: true, enumerable: false},
          unchanged: {value: -8, writable: true, enumerable: true},
        }),
        enumerable: true,
      },
      unchangedNested: {
        value: Object.defineProperties({}, {
          writable: {value: -9, writable: true, enumerable: true},
        }),
        enumerable: true,
      },
    });

    writeProps(props, {
      constant: 1,
      writable: 2,
      added: 3,
      hidden: 4,
      unchanged: undefined,
      nested: {
        constant: 5,
        writable: 6,
        added: 7,
        hidden: 8,
        unchanged: undefined,
      },
      addedNested: {
      },
    });

    expect(props.constant).to.be.equal(-1);
    expect(props.writable).to.be.equal(2);
    expect(props.hidden).to.be.equal(-3);
    expect(props.unchanged).to.be.equal(-4);
    expect(props).to.not.have.property('added');
    expect(props.nested.constant).to.be.equal(-5);
    expect(props.nested.writable).to.be.equal(6);
    expect(props.nested.hidden).to.be.equal(-7);
    expect(props.nested.unchanged).to.be.equal(-8);
    expect(props.nested).to.not.have.property('added');
    expect(props.unchangedNested).to.deep.equal({writable: -9});
    expect(props).to.not.have.property('addedNested');
  });
});
