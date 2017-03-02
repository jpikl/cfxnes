import {readPropertyValues, writePropertyValues} from '../../src/props/values';

describe('props/values', () => {
  let props;

  beforeEach(() => {
    props = Object.defineProperties({}, {
      writable: {value: -1, writable: true, enumerable: true},
      constant: {value: -2, writable: false, enumerable: true},
      ignored: {value: -3, writable: true, enumerable: false},
      unchanged: {value: -4, writable: true, enumerable: true},
      nested: {
        value: Object.defineProperties({}, {
          writable: {value: -5, writable: true, enumerable: true},
          constant: {value: -6, writable: false, enumerable: true},
          ignored: {value: -7, writable: true, enumerable: false},
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
  });

  it('writes values to properties', () => {
    writePropertyValues(props, {
      writable: 1,
      constant: 2,
      added: 3,
      ignored: 4,
      unchanged: undefined,
      nested: {
        writable: 5,
        constant: 6,
        added: 7,
        ignored: 8,
        unchanged: undefined,
      },
      addedNested: {
      },
    });

    expect(props.writable).to.be.equal(1);
    expect(props.constant).to.be.equal(-2);
    expect(props.ignored).to.be.equal(-3);
    expect(props.unchanged).to.be.equal(-4);
    expect(props).to.not.have.property('added');
    expect(props.nested.writable).to.be.equal(5);
    expect(props.nested.constant).to.be.equal(-6);
    expect(props.nested.ignored).to.be.equal(-7);
    expect(props.nested.unchanged).to.be.equal(-8);
    expect(props.nested).to.not.have.property('added');
    expect(props.unchangedNested).to.deep.equal({writable: -9});
    expect(props).to.not.have.property('addedNested');
  });

  it('reads values of properties', () => {
    expect(readPropertyValues(props)).to.deep.equal({
      writable: -1,
      unchanged: -4,
      nested: {
        writable: -5,
        unchanged: -8,
      },
      unchangedNested: {
        writable: -9,
      },
    });
  });
});
