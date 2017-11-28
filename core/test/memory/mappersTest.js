import {expect} from 'chai';
import {Mapper} from '../../src';
import {createMapper} from '../../src/memory/mappers';

describe('memory/mappers', () => {
  const mappers = [
    Mapper.AOROM,
    Mapper.BNROM,
    Mapper.CNROM,
    Mapper.COLOR_DREAMS,
    Mapper.MMC1,
    Mapper.MMC3,
    Mapper.NINA_001,
    Mapper.NROM,
    Mapper.UNROM,
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
