/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CFxNES from '../src/CFxNES';
import {copyArray} from '../../core/src/utils/array';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('CFxNES', () => {
  before(() => {
    defineGlobal('window', {addEventListener() {}});
    defineGlobal('document', {addEventListener() {}});
    defineGlobal('screen', {width: 800, height: 600});
    defineGlobal('navigator', {});
    defineGlobal('File', () => {});
  });

  it('should initialize without error', () => {
    return new CFxNES();
  });

  it('should load ROM image from array', () => {
    const cfxnes = new CFxNES();
    const buffer = fs.readFileSync('../core/test/roms/nestest/nestest.nes');
    const array = copyArray(buffer, new Uint8Array(buffer.length));
    expect(cfxnes.isROMLoaded()).to.be.false;
    return expect(cfxnes.loadROM(array)
      .then(() => cfxnes.isROMLoaded()))
      .to.eventually.be.true;
  });
});

function defineGlobal(name, value) {
  GLOBAL[name] = value;
  if (name !== 'window') {
    GLOBAL.window[name] = value;
  }
}
