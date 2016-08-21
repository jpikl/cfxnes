/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import {createCartridge} from '../../../core/test/data/utils';
import NVRAM from '../../src/data/NVRAM';
import {nvramStore, closeDB, deleteDB} from '../../src/data/database';

describe('data/NVRAM (no cartridge)', () => {
  let nvram;

  beforeEach(() => {
    nvram = new NVRAM(new NES);
  });

  it('accesses null', () => {
    expect(nvram.access()).to.be.null;
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

  it('accesses null', () => {
    expect(nvram.access()).to.be.null;
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

  after(closeDB);

  it('accesses data', () => {
    expect(nvram.access()).to.be.an('uint8array');
    expect(nvram.access()).to.have.length(10);
  });

  it('accesses the same object every time', () => {
    const data = nvram.access();
    expect(nvram.access()).to.be.equal(data);
  });

  it('loads data', () => {
    const {sha1} = cartridge;
    return nvramStore.put(sha1, testData)
      .then(() => nvram.load())
      .then(() => expect(nvram.access()).to.deep.equal(testData));
  });

  it('saves data', () => {
    const {sha1} = cartridge;
    nvram.access().set(testData);
    const result = nvram.save().then(() => nvramStore.get(sha1));
    return expect(result).to.eventually.deep.equal(testData);
  });
});
