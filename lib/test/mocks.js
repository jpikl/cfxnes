import MockLocalStorage from 'mock-localstorage';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';

export function mockWindow() {
  defineGlobal('window', {addEventListener() {}});
  defineGlobal('document', {addEventListener() {}});
  defineGlobal('screen', {width: 800, height: 600});
  defineGlobal('navigator', {});
}

export function mockLocalStorage() {
  defineGlobal('localStorage', new MockLocalStorage);
}

export function mockIndexedDB() {
  var indexedDB = new FDBFactory;
  indexedDB.fake = true;
  defineGlobal('indexedDB', indexedDB);
}

function defineGlobal(name, value) {
  GLOBAL[name] = value;
  if (name !== 'window') {
    GLOBAL.window[name] = value;
  }
}
