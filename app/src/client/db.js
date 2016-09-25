/* eslint-disable no-unused-vars */

const DB_NAME = 'cfxnes';
const DB_VERSION = 1;

let dbPromise;

//=========================================================
// Database
//=========================================================

function doWithDB(callback) {
  if (dbPromise == null) {
    dbPromise = openDB();
  }
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => callback(db, resolve, reject));
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    console.info(`Opening database ${DB_NAME} (version: ${DB_VERSION})`);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database is blocked and cannot be upgraded'));
    request.onupgradeneeded = event => upgrageDB(request, event.oldVersion, event.newVersion);
  });
}

function upgrageDB(request, oldVersion, newVersion) {
  console.info(`Upgrading database ${DB_NAME} from version ${oldVersion} to ${newVersion}`);
  request.result.createObjectStore('nvram', {keyPath: 'sha1'});
}

function closeDB() {
  if (dbPromise == null) {
    return Promise.resolve();
  }
  return dbPromise.then(db => {
    console.info(`Closing database ${DB_NAME}`);
    db.close();
    dbPromise = null;
  });
}

function doWithClosedDB(callback) {
  return closeDB().then(() => new Promise(callback));
}

function deleteDB() {
  return doWithClosedDB((resolve, reject) => {
    console.info(`Deleting database ${DB_NAME}`);
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database is blocked and cannot be deleted'));
  });
}

//=========================================================
// NVRAM store
//=========================================================

function getNVRAM(sha1) {
  console.info(`Getting NVRAM from DB store for ${sha1}`);
  return doWithDB((db, resolve, reject) => {
    const transaction = db.transaction('nvram', 'readonly');
    const store = transaction.objectStore('nvram');
    const request = store.get(sha1);
    request.onsuccess = () => {
      const result = request.result;
      resolve((result && result['data']) || null);
    };
    request.onerror = () => reject(request.error);
  });
}

function putNVRAM(sha1, data) {
  console.info(`Putting NVRAM to DB store for ${sha1}`);
  return doWithDB((db, resolve, reject) => {
    const transaction = db.transaction('nvram', 'readwrite');
    const store = transaction.objectStore('nvram');
    const request = store.put({sha1, data});
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearNVRAM() {
  console.info('Clearing NVRAM DB store');
  return doWithDB((db, resolve, reject) => {
    const transaction = db.transaction('nvram', 'readwrite');
    const store = transaction.objectStore('nvram');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// export const nvramStore = {get: getNVRAM, put: putNVRAM, clear: clearNVRAM};
