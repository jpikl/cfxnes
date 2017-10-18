import {log} from '../../common';

const DB = 'cfxnes';
const VERSION = 1;

let promise;

export function use(callback) {
  if (promise == null) {
    promise = open();
  }
  return promise.then(db => {
    return new Promise((resolve, reject) => callback(db, resolve, reject));
  });
}

function open() {
  return new Promise((resolve, reject) => {
    log.info(`Opening database ${DB} (version: ${VERSION})`);
    const request = indexedDB.open(DB, VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database is blocked and cannot be upgraded'));
    request.onupgradeneeded = event => upgrade(request, event.oldVersion, event.newVersion);
  });
}

function upgrade(request, oldVersion, newVersion) {
  log.info(`Upgrading database ${DB} from version ${oldVersion} to ${newVersion}`);
  request.result.createObjectStore('nvram', {keyPath: 'sha1'});
}

export function close() {
  if (promise == null) {
    return Promise.resolve();
  }
  return promise.then(db => {
    log.info(`Closing database ${DB}`);
    db.close();
    promise = null;
  });
}

export function destroy() {
  close().then(() => new Promise((resolve, reject) => {
    log.info(`Deleting database ${DB}`);
    const request = indexedDB.deleteDatabase(DB);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database is blocked and cannot be deleted'));
  }));
}
