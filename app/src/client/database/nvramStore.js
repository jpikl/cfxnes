import {log} from '../../common';
import {use} from './commands';

const STORE = 'nvram';

export function get(sha1) {
  log.info(`Getting NVRAM from DB store for ${sha1}`);
  return use((db, resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const request = store.get(sha1);
    request.onsuccess = () => {
      const {result} = request;
      resolve((result && result.data) || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export function put(sha1, data) {
  log.info(`Putting NVRAM to DB store for ${sha1}`);
  return use((db, resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const request = store.put({sha1, data});
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function clear() {
  log.info('Clearing NVRAM DB store');
  return use((db, resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
