import {expect} from 'chai';
import Mirroring from '../../src/common/Mirroring';

describe('common/Mirroring', () => {
  it('provides single-screen variant for areas 0-3', () => {
    expect(Mirroring.getSingle(0)).to.equal(Mirroring.SCREEN_0);
    expect(Mirroring.getSingle(1)).to.equal(Mirroring.SCREEN_1);
    expect(Mirroring.getSingle(2)).to.equal(Mirroring.SCREEN_2);
    expect(Mirroring.getSingle(3)).to.equal(Mirroring.SCREEN_3);
  });

  it('provides areas for each value', () => {
    expect(Mirroring.getAreas(Mirroring.SCREEN_0)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.SCREEN_1)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.SCREEN_2)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.SCREEN_3)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.VERTICAL)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.HORIZONTAL)).to.be.an('array').with.lengthOf(4);
    expect(Mirroring.getAreas(Mirroring.FOUR_SCREEN)).to.be.an('array').with.lengthOf(4);
  });

  it('throws error when getting area for invalid value', () => {
    expect(() => Mirroring.getAreas()).to.throw('Invalid mirroring: undefined');
    expect(() => Mirroring.getAreas('x')).to.throw('Invalid mirroring: "x"');
  });
});
