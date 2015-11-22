import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
var expect = chai.expect;

const A_PRG = Uint8Array.of(0x01, 0x02, 0x03);
const A_CHR = Uint8Array.of(0x04, 0x05, 0x06);
const B_PRG = Uint8Array.of(0x07, 0x08, 0x09);
const B_CHR = Uint8Array.of(0x0a, 0x0b, 0x0c);

export default function makeTest({name, factory, before}) {

  describe(name, () => {

    var storage;

    if (before) {
      before(before);
    }

    beforeEach(() => {
      storage = factory();
    });

    it('should read null for missing configuration', () => {
      return expect(storage.readConfiguration()).to.eventually.be.null;
    });

    it('should read/write configuration', () => {
      var config = {key: 'value'};
      return storage.writeConfiguration(config).then(() => {
        return Promise.all([
          expect(storage.readConfiguration()).not.to.eventually.equal(config),
          expect(storage.readConfiguration()).to.eventually.deep.equal(config),
        ]);
      });
    });

    it('should delete configuration', () => {
      return storage.writeConfiguration({key: 'value'}).then(() => {
        return storage.deleteConfiguration().then(() => {
          return expect(storage.readConfiguration()).to.eventually.be.null;
        });
      });
    });

    it('should read null for missing RAM', () => {
      return Promise.all([
        expect(storage.readRAM('A', 'prg')).to.be.eventually.null,
        expect(storage.readRAM('B', 'chr')).to.be.eventually.null,
      ]);
    });

    it('should read/write RAM', () => {
      return initStorage().then(() => {
        return Promise.all([
          expect(storage.readRAM('A', 'prg')).not.to.eventually.equal(A_PRG),
          expect(storage.readRAM('A', 'chr')).not.to.eventually.equal(A_CHR),
          expect(storage.readRAM('B', 'prg')).not.to.eventually.equal(B_PRG),
          expect(storage.readRAM('B', 'chr')).not.to.eventually.equal(B_CHR),
          expect(storage.readRAM('A', 'prg', new Uint8Array(3))).to.eventually.deep.equal(A_PRG),
          expect(storage.readRAM('A', 'chr', new Uint8Array(3))).to.eventually.deep.equal(A_CHR),
          expect(storage.readRAM('B', 'prg', new Uint8Array(3))).to.eventually.deep.equal(B_PRG),
          expect(storage.readRAM('B', 'chr', new Uint8Array(3))).to.eventually.deep.equal(B_CHR),
        ]);
      });
    });

    it('should delete RAM with ID', () => {
      return initStorage().then(() => {
        return Promise.all([
          storage.deleteRAM('A'),
        ]);
      }).then(() => {
        return Promise.all([
          expect(storage.readRAM('A', 'prg', new Uint8Array(3))).to.eventually.be.null,
          expect(storage.readRAM('A', 'chr', new Uint8Array(3))).to.eventually.be.null,
          expect(storage.readRAM('B', 'prg', new Uint8Array(3))).to.eventually.deep.equal(B_PRG),
          expect(storage.readRAM('B', 'chr', new Uint8Array(3))).to.eventually.deep.equal(B_CHR),
        ]);
      });
    });

    it('should delete all RAMs', () => {
      return initStorage().then(() => {
        return Promise.all([
          storage.deleteRAM(),
        ]);
      }).then(() => {
        return Promise.all([
          expect(storage.readRAM('A', 'prg', new Uint8Array(3))).to.eventually.be.null,
          expect(storage.readRAM('A', 'chr', new Uint8Array(3))).to.eventually.be.null,
          expect(storage.readRAM('B', 'prg', new Uint8Array(3))).to.eventually.be.null,
          expect(storage.readRAM('B', 'chr', new Uint8Array(3))).to.eventually.be.null,
        ]);
      });
    });

    function initStorage() {
      return Promise.all([
        storage.writeRAM('A', 'prg', A_PRG),
        storage.writeRAM('A', 'chr', A_CHR),
        storage.writeRAM('B', 'prg', B_PRG),
        storage.writeRAM('B', 'chr', B_CHR),
      ]);
    }

  });

}
