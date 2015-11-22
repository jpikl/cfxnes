import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import CFxNES from '../src/CFxNES';
import { copyArray } from '../../core/src/utils/arrays';
import { mockWindow } from './mocks';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('CFxNES', () => {

  before(mockWindow);

  it('should initialize without error', () => {
    new CFxNES();
  });

  it('should accept valid cartdige', () => {
    return new Promise((resolve, reject) => {
      var cfxnes = new CFxNES();
      fs.readFile('../core/test/roms/nestest/nestest.nes', (error, data) => {
        if (data) {
          var buffer = new ArrayBuffer(data.length);
          copyArray(data, new Uint8Array(buffer));
          cfxnes.insertCartridge(buffer).then(resolve, reject);
        } else {
          reject(error);
        }
      });
    });
  });

});
