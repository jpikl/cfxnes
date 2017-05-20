import read from '../../src/props/read';

describe('props/read', () => {
  it('reads values of properties', () => {
    const props = Object.defineProperties({}, {
      constant: {value: 1, writable: false, enumerable: true},
      writable: {value: 2, writable: true, enumerable: true},
      hidden: {value: 3, writable: true, enumerable: false},
      nested: {
        value: Object.defineProperties({}, {
          constant: {value: 4, writable: false, enumerable: true},
          writable: {value: 5, writable: true, enumerable: true},
          ignored: {value: 6, writable: true, enumerable: false},
        }),
        enumerable: true,
      },
      hiddenNested: {
        value: Object.defineProperties({}, {
          constant: {value: 7, writable: false, enumerable: true},
          writable: {value: 8, writable: true, enumerable: true},
          hidden: {value: 9, writable: true, enumerable: false},
        }),
        enumerable: false,
      },
    });

    expect(read(props)).to.deep.equal({
      writable: 2,
      nested: {
        writable: 5,
      },
    });
  });
});
