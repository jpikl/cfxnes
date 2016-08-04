/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import {createCartridge} from '../../../core/test/data/utils';
import NVRAM from '../../src/data/NVRAM';
import {nvramStore, deleteDB} from '../../src/data/database';

describe('data/NVRAM (no cartridge)', () => {
  let nvram;

  beforeEach(() => {
    nvram = new NVRAM(new NES);
  });

  it('gets zero size', () => {
    expect(nvram.size()).to.be.equal(0);
  });

  it('gets null data', () => {
    expect(nvram.get()).to.be.null;
  });

  it('throws error when setting any data', () => {
    expect(() => nvram.set()).to.throw('NVRAM is not available');
    expect(() => nvram.set([])).to.throw('NVRAM is not available');
    expect(() => nvram.set(new Uint8Array())).to.throw('NVRAM is not available');
  });

  it('loads data with no effect', () => {
    return nvram.load();
  });

  it('saves data with no effect', () => {
    return nvram.save();
  });
});

describe('data/NVRAM (cartridge set)', () => {
  let nvram;

  beforeEach(() => {
    const nes = new NES;
    nes.setCartridge(createCartridge());
    nvram = new NVRAM(nes);
  });

  it('gets zero size', () => {
    expect(nvram.size()).to.be.equal(0);
  });

  it('gets null data', () => {
    expect(nvram.get()).to.be.null;
  });

  it('throws error when setting any data', () => {
    expect(() => nvram.set()).to.throw('NVRAM is not available');
    expect(() => nvram.set([])).to.throw('NVRAM is not available');
    expect(() => nvram.set(new Uint8Array())).to.throw('NVRAM is not available');
  });

  it('loads data with no effect', () => {
    return nvram.load();
  });

  it('saves data with no effect', () => {
    return nvram.save();
  });
});

describe('data/NVRAM (cartridge with NVRAM set)', () => {
  let nvram, testData, cartridge;

  before(() => {
    testData = new Uint8Array(10).fill(1);
    cartridge = createCartridge({sha1: 'x', prgRAMSize: 10, prgRAMSizeBattery: 10});
  });

  beforeEach(() => {
    const nes = new NES;
    nes.setCartridge(cartridge);
    nvram = new NVRAM(nes);
    return deleteDB();
  });

  it('gets size', () => {
    expect(nvram.size()).to.be.equal(10);
  });

  it('gets data', () => {
    expect(nvram.get()).to.be.an('uint8array');
    expect(nvram.get()).to.have.length(10);
  });

  it('sets data', () => {
    nvram.set(testData);
    expect(nvram.get()).to.deep.equal(testData);
  });

  it('throws error when setting invalid data', () => {
    expect(() => nvram.set()).to.throw('Invalid NVRAM data type');
    expect(() => nvram.set([])).to.throw('Invalid NVRAM data type');
    expect(() => nvram.set(new Uint8Array(9))).to.throw('Invalid NVRAM data size');
    expect(() => nvram.set(new Uint8Array(11))).to.throw('Invalid NVRAM data size');
  });

  it('loads data', () => {
    const {sha1} = cartridge;
    return nvramStore.put(sha1, testData)
      .then(() => nvram.load())
      .then(() => expect(nvram.get()).to.deep.equal(testData));
  });

  it('saves data', () => {
    const {sha1} = cartridge;
    nvram.set(testData);
    const result = nvram.save().then(() => nvramStore.get(sha1));
    return expect(result).to.eventually.deep.equal(testData);
  });
});
