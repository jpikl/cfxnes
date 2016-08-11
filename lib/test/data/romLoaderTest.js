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
    romLoader = new ROMLoader(new NES, system, JSZip);
  });

  it('is unloaded by default', () => {
    expect(romLoader.isLoaded()).to.be.false;
  });

  it('loads ROM from URL', () => {
    return romLoader.load('roms/nestest.nes')
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('loads zipped ROM from URL', () => {
    return romLoader.load('base/test/roms/nestest.zip')
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('loads ROM from blob', () => {
    return romLoader.load(new Blob([romData]))
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('loads ROM from ArrayBuffer', () => {
    return romLoader.load(romData.buffer)
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('loads ROM from Uint8Array', () => {
    return romLoader.load(romData)
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('loads ROM from Array', () => {
    return romLoader.load([...romData])
      .then(() => expect(romLoader.isLoaded()).to.be.true);
  });

  it('throws error for invalid source', () => {
    expect(() => romLoader.load()).to.throw('Invalid source');
    expect(() => romLoader.load(123)).to.throw('Invalid source');
    expect(() => romLoader.load({})).to.throw('Invalid source');
  });

  it('restarts running system', () => {
    system.running = true;
    return romLoader.load(romData)
      .then(() => expect(system.restarted).to.be.true);
  });

  it('does not restart paused system', () => {
    system.running = false;
    return romLoader.load(romData)
      .then(() => expect(system.restarted).to.be.false);
  });

  it('unloads ROM', () => {
    return romLoader.load(romData).then(() => {
      romLoader.unload();
      expect(romLoader.isLoaded()).to.be.false;
    });
  });
});
