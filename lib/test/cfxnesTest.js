import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import CFxNES from '../src/CFxNES';
import {copyArray} from '../../core/src/utils/arrays';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('CFxNES', () => {

  before(() => {
    defineGlobal('window', {addEventListener() {}});
    defineGlobal('document', {addEventListener() {}});
    defineGlobal('screen', {width: 800, height: 600});
    defineGlobal('navigator', {});
    defineGlobal('File', function() {});
  });

  it('should initialize without error', () => {
    new CFxNES();
  });

  it('should load ROM image from array', () => {
    var cfxnes = new CFxNES();
    var buffer = fs.readFileSync('../core/test/roms/nestest/nestest.nes');
    var array = copyArray(buffer, new Uint8Array(buffer.length));
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
