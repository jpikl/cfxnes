import makeTest from '../../../core/test/storages/storageTest';
import BrowserStorage from '../../src/storages/BrowserStorage';
import { mockWindow, mockLocalStorage, mockIndexedDB } from '../mocks';

makeTest({
  name: 'BrowserStorage',
  before() {
    mockWindow();
    mockLocalStorage();
    mockIndexedDB();
  },
  factory() {
    return new BrowserStorage;
  },
});
