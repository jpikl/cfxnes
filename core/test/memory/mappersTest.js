import {expect} from 'chai';
import {MapperType} from '../../src';
import {createMapper} from '../../src/memory/mappers';

describe('memory/mappers', () => {
  const mappers = [
    MapperType.AOROM,
    MapperType.BNROM,
    MapperType.CNROM,
    MapperType.COLOR_DREAMS,
    MapperType.MMC1,
    MapperType.MMC3,
    MapperType.NINA_001,
    MapperType.NROM,
    MapperType.UNROM,
  ];

  for (const mapper of mappers) {
    it(`creates ${mapper} mapper`, () => {
      expect(createMapper({mapper})).to.be.an('object');
    });
  }

  it('throws error when creating invalid mapper', () => {
    expect(() => createMapper({})).to.throw('Invalid mapper: undefined');
    expect(() => createMapper({mapper: 'x'})).to.throw('Invalid mapper: "x"');
  });
});
