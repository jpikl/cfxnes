import {fetchUrl, readBlob} from '../../src/rom/load';

describe('rom/load', () => {
  it('fetches data from valid URL', () => {
    const promise = fetchUrl('data/nestest.nes');
    return expect(promise)
      .to.eventually.be.an('ArrayBuffer')
      .with.property('byteLength', 24592);
  });

  it('rejects invalid URL', () => {
    return expect(fetchUrl('invalid')).to.eventually.be.rejectedWith(Error);
  });

  it('reads blob', () => {
    const promise = readBlob(new Blob([new Uint8Array(32)]));
    return expect(promise)
      .to.eventually.be.an('ArrayBuffer')
      .with.property('byteLength', 32);
  });
});
