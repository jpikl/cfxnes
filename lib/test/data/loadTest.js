import {fetchURL, readBlob} from '../../src/data/load';

describe('data/load', () => {
  it('fetches data from valid URL', () => {
    const promise = fetchURL('roms/nestest.nes');
    return Promise.all([
      expect(promise).to.eventually.be.an('arraybuffer'),
      expect(promise).to.eventually.have.property('byteLength', 24592),
    ]);
  });

  it('rejects invalid URL', () => {
    return expect(fetchURL('invalid')).to.eventually.be.rejectedWith(Error);
  });

  it('reads blob', () => {
    const promise = readBlob(new Blob([new Uint8Array(32)]));
    return Promise.all([
      expect(promise).to.eventually.be.an('arraybuffer'),
      expect(promise).to.eventually.have.property('byteLength', 32),
    ]);
  });
});
