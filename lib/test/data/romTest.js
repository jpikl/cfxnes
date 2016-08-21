/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import JSZip from 'jszip';
import NES from '../../../core/src/NES';
import {createINES} from '../../../core/test/data/utils';
import ROM from '../../src/data/ROM';

describe('data/ROM', () => {
  let system, rom, romData;

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
    rom = new ROM(new NES, system, JSZip);
  });

  it('is unloaded by default', () => {
    expect(rom.isLoaded()).to.be.false;
  });

  it('loads ROM from URL', () => {
    return rom.load('roms/nestest.nes')
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads zipped ROM from URL', () => {
    return rom.load('base/test/roms/nestest.zip')
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads ROM from blob', () => {
    return rom.load(new Blob([romData]))
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads ROM from ArrayBuffer', () => {
    return rom.load(romData.buffer)
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads ROM from Uint8Array', () => {
    return rom.load(romData)
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads ROM from Array', () => {
    return rom.load([...romData])
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('throws error for invalid source', () => {
    expect(() => rom.load()).to.throw('Invalid source');
    expect(() => rom.load(123)).to.throw('Invalid source');
    expect(() => rom.load({})).to.throw('Invalid source');
  });

  it('gets SHA-1 of loaded ROM', () => {
    return rom.load(romData)
      .then(() => expect(rom.getSHA1()).to.be.equal('be169f329e7b8ecd1b59994f6634041d6b3f664a'));
  });

  it('restarts running system', () => {
    system.running = true;
    return rom.load(romData)
      .then(() => expect(system.restarted).to.be.true);
  });

  it('does not restart paused system', () => {
    system.running = false;
    return rom.load(romData)
      .then(() => expect(system.restarted).to.be.false);
  });

  it('unloads ROM', () => {
    return rom.load(romData).then(() => {
      rom.unload();
      expect(rom.isLoaded()).to.be.false;
    });
  });
});
