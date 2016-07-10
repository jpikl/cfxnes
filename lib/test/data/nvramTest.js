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

  it('should return zero size', () => {
    expect(nvram.getSize()).to.be.equal(0);
  });

  it('should return null data', () => {
    expect(nvram.get()).to.be.null;
  });

  it('should set data with no effect', () => {
    nvram.set(new Uint8Array(10));
  });

  it('should load data with no effect', () => {
    return nvram.load();
  });

  it('should save data with no effect', () => {
    return nvram.save();
  });
});

describe('data/NVRAM (cartridge inserted)', () => {
  let nvram;

  beforeEach(() => {
    const nes = new NES;
    nes.setCartridge(createCartridge());
    nvram = new NVRAM(nes);
  });

  it('should return zero size', () => {
    expect(nvram.getSize()).to.be.equal(0);
  });

  it('should return null data', () => {
    expect(nvram.get()).to.be.null;
  });

  it('should set data with no effect', () => {
    nvram.set(new Uint8Array(10));
  });

  it('should load data with no effect', () => {
    return nvram.load();
  });

  it('should save data with no effect', () => {
    return nvram.save();
  });
});

describe('data/NVRAM (cartridge with NVRAM inserted)', () => {
  let nvram, testData, cartridge;

  before(() => {
    testData = new Uint8Array(10).fill(1);
    cartridge = createCartridge({prgRAMSize: 10, prgRAMSizeBattery: 10});
  });

  beforeEach(() => {
    const nes = new NES;
    nes.setCartridge(cartridge);
    nvram = new NVRAM(nes);
    return deleteDB();
  });

  it('should return size', () => {
    expect(nvram.getSize()).to.be.equal(10);
  });

  it('should return data', () => {
    expect(nvram.get()).to.be.an('uint8array');
    expect(nvram.get()).to.have.length(10);
  });

  it('should set data', () => {
    nvram.set(testData);
    expect(nvram.get()).to.deep.equal(testData);
  });

  it('should not load NVRAM when SHA-1 is not available', () => {
    return nvram.load()
      .then(() => expect(nvram.get()).not.to.deep.equal(testData));
  });

  it('should not save NVRAM when SHA-1 is not avaialable', () => {
    nvram.set(testData);
    return nvram.save();
  });

  it('should load NVRAM when SHA-1 is available', () => {
    cartridge.sha1 = 'x';
    return nvramStore.put('x', testData)
      .then(() => nvram.load())
      .then(() => expect(nvram.get()).to.deep.equal(testData));
  });

  it('should save NVRAM when SHA-1 is available', () => {
    cartridge.sha1 = 'x';
    nvram.set(testData);
    const result = nvram.save().then(() => nvramStore.get('x'));
    return expect(result).to.eventually.deep.equal(testData);
  });
});
