import {expect} from 'chai';
import {createMapper} from '../../src/memory/mappers';

describe('memory/mappers', () => {
  const mappers = [
    'AOROM',
    'BNROM',
    'CNROM',
    'ColorDreams',
    'MMC1',
    'MMC3',
    'NINA-001',
    'NROM',
    'UNROM',
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
