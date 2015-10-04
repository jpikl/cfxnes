import MockLocalStorage from 'mock-localstorage';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';
import makeTest from '../../core/storages/storageTest';
import BrowserStorage from '../../../../src/lib/browser/storages/BrowserStorage';

makeTest('BrowserStorage', () => {
  GLOBAL.localStorage = new MockLocalStorage;
  GLOBAL.indexedDB = new FDBFactory;
  GLOBAL.indexedDB.fake = true;
  return new BrowserStorage;
});
