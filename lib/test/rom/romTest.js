import JSZip from 'jszip';
import {NES} from '../../../core';
import {createINES} from '../../../core/test/cartridge/utils';
import ROM from '../../src/rom/ROM';

describe('rom/ROM', () => {
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
    return rom.load('data/nestest.nes')
      .then(() => expect(rom.isLoaded()).to.be.true);
  });

  it('loads zipped ROM from URL', () => {
    return rom.load('data/nestest.zip')
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
    expect(() => rom.load()).to.throw('Invalid source: undefined');
    expect(() => rom.load(123)).to.throw('Invalid source: 123');
    expect(() => rom.load({})).to.throw('Invalid source: Object');
  });

  it('fails to unzip ROM image when JSZip is not provided', () => {
    rom = new ROM(new NES, system);
    return expect(rom.load('data/nestest.zip'))
      .to.eventually.be.rejectedWith('Unable to extract ROM image: JSZip 3 is not available');
  });

  it('fails to unzip ROM image when it is not present in ZIP archive', () => {
    return expect(rom.load('data/norom.zip'))
      .to.eventually.be.rejectedWith('ZIP archive does not contain ".nes" ROM image');
  });

  it('returns null SHA-1 when unloaded', () => {
    expect(rom.getSHA1()).to.be.null;
  });

  it('returns SHA-1 of loaded ROM', () => {
    return rom.load(romData)
      .then(() => expect(rom.getSHA1()).to.equal('be169f329e7b8ecd1b59994f6634041d6b3f664a'));
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
