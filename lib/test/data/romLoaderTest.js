/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import JSZip from 'jszip';
import NES from '../../../core/src/NES';
import {createINES} from '../../../core/test/data/utils';
import ROMLoader from '../../src/data/ROMLoader';

describe('data/ROMLoader', () => {
  let system, romLoader, romData;

  before(() => {
    romData = createINES();
  });

  beforeEach(() => {
    system = {
      running: false,
      restarted: false,
      isRunning() { return this.running; },
      restart() { this.restarted = true; },
    };
    romLoader = new ROMLoader(new NES, {JSZip}, system);
  });

  it('should be unloaded by default', () => {
    expect(romLoader.isLoaded()).to.be.false;
  });

  it('should load ROM from URL', () => {
    return romLoader.load('roms/nestest.nes')
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should load zipped ROM from URL', () => {
    return romLoader.load('base/test/roms/nestest.zip')
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should load ROM from File', () => {
    return romLoader.load(new File([romData], 'nestest.nes'))
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should load ROM from ArrayBuffer', () => {
    return romLoader.load(romData.buffer)
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should load ROM from Uint8Array', () => {
    return romLoader.load(romData)
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should load ROM from Array', () => {
    return romLoader.load([...romData])
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('should throw error for unsupported source', () => {
    expect(() => romLoader.load(null)).to.throw(Error);
  });

  it('should restart running system', () => {
    system.running = true;
    return romLoader.load(romData)
      .then(() => expect(system.restarted).to.be.true);
  });

  it('should not restart paused system', () => {
    system.running = false;
    return romLoader.load(romData)
      .then(() => expect(system.restarted).to.be.false);
  });

  it('should unload ROM', () => {
    return romLoader.load(romData).then(() => {
      romLoader.unload();
      expect(romLoader.isLoaded()).to.be.false;
    });
  });
});
