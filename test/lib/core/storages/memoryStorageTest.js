import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import MemoryStorage from '../../../../src/lib/core/storages/MemoryStorage';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('MemoryStorage', () => {

  var storage = new MemoryStorage;

  it('should read/write configuration', () => {
    var config = {key: 'value'};
    return storage.writeConfiguration(config).then(() => {
      return expect(storage.readConfiguration()).to.eventually.deep.equal(config);
    });
  });

  it('should read/write PRG RAM', () => {
    var keyA = 'A';
    var keyB = 'B';
    var inputA = [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7];
    var inputB = [0x8, 0x9, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF];
    return Promise.all([
      expect(readWritePRGRAM(keyA, inputA)).to.eventually.deep.equal(inputA),
      expect(readWritePRGRAM(keyB, inputB)).to.eventually.deep.equal(inputB),
    ]);
  });

  it('should read/write CHR RAM', () => {
    var keyA = 'A';
    var keyB = 'B';
    var inputA = [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7];
    var inputB = [0x8, 0x9, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF];
    return Promise.all([
      expect(readWriteCHRRAM(keyA, inputA)).to.eventually.deep.equal(inputA),
      expect(readWriteCHRRAM(keyB, inputB)).to.eventually.deep.equal(inputB),
    ]);
  });

  function readWritePRGRAM(key, value) {
    return storage.writePRGRAM(key, value).then(() => {
      return storage.readPRGRAM(key, new Array(value.length));
    });
  }

  function readWriteCHRRAM(key, value) {
    return storage.writeCHRRAM(key, value).then(() => {
      return storage.readCHRRAM(key, new Array(value.length));
    });
  }

});
