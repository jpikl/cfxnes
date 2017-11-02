import {createCartridge, log, formatSize, describe} from '../../../core';
import {fetchURL, readBlob} from './load';

export default class ROM {

  constructor(nes, system, JSZip) {
    log.info('Initializing ROM loader');
    this.nes = nes;
    this.system = system;
    this.JSZip = JSZip;
  }

  load(source) {
    if (typeof source === 'string') {
      return fetchURL(source).then(data => this.loadData(data));
    }
    if (source instanceof Blob) {
      return readBlob(source).then(data => this.loadData(data));
    }
    if (source instanceof Array || source instanceof ArrayBuffer || source instanceof Uint8Array) {
      return this.loadData(source);
    }
    throw new Error('Invalid source: ' + describe(source));
  }

  loadData(source) {
    if (!(source instanceof Uint8Array)) {
      source = new Uint8Array(source);
    }
    return this.unzipData(source).then(data => {
      const cartridge = createCartridge(data);
      this.nes.setCartridge(cartridge);
      if (this.system.isRunning()) {
        this.system.restart();
      }
    });
  }

  unzipData(data) {
    if (hasZipSignature(data)) {
      log.info(`Extracting ROM image from ${formatSize(data.length)} ZIP archive`);
      const {JSZip} = this;
      if (JSZip == null || JSZip.loadAsync == null) {
        throw new Error('Unable to extract ROM image: JSZip 3 is not available');
      }
      return JSZip.loadAsync(data).then(zip => {
        const files = zip.file(/^.*\.nes$/i);
        if (files.length === 0) {
          throw new Error('ZIP archive does not contain ".nes" ROM image');
        }
        return files[0].async('uint8array');
      });
    }
    return Promise.resolve(data);
  }

  unload() {
    if (this.isLoaded()) {
      log.info('Unloading ROM image');
      this.nes.setCartridge(null);
    }
  }

  isLoaded() {
    return this.nes.getCartridge() != null;
  }

  getSHA1() {
    const cartridge = this.nes.getCartridge();
    return cartridge ? cartridge.sha1 : null;
  }

}

function hasZipSignature(data) {
  return data[0] === 0x50
      && data[1] === 0x4B
      && data[2] === 0x03
      && data[3] === 0x04;
}
