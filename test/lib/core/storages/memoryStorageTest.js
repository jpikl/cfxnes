import makeTest from './storageTest';
import MemoryStorage from '../../../../src/lib/core/storages/MemoryStorage';

makeTest('MemoryStorage', () => new MemoryStorage);
