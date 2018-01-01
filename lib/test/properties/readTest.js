import readProperties from '../../src/properties/read';

const {defineProperties} = Object;

describe('properties/read', () => {
  it('reads values of properties', () => {
    const props = defineProperties({}, {
      constant: {value: 1, writable: false, enumerable: true},
      writable: {value: 2, writable: true, enumerable: true},
      hidden: {value: 3, writable: true, enumerable: false},
      nested: {
        value: defineProperties({}, {
          constant: {value: 4, writable: false, enumerable: true},
          writable: {value: 5, writable: true, enumerable: true},
          ignored: {value: 6, writable: true, enumerable: false},
        }),
        enumerable: true,
      },
      hiddenNested: {
        value: defineProperties({}, {
          constant: {value: 7, writable: false, enumerable: true},
          writable: {value: 8, writable: true, enumerable: true},
          hidden: {value: 9, writable: true, enumerable: false},
        }),
        enumerable: false,
      },
    });

    expect(readProperties(props)).to.deep.equal({
      writable: 2,
      nested: {
        writable: 5,
      },
    });
  });
});
