import makeTest from './storageTest';
import MemoryStorage from '../../src/storages/MemoryStorage';

makeTest('MemoryStorage', () => new MemoryStorage);
