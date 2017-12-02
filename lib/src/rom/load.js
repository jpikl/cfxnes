import {log, formatSize} from '../../../core';

const BLOB_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

export function fetchURL(url) {
  log.info(`Downloading data from "${url}"`);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest;
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      if (request.status === 200) {
        resolve(request.response);
      } else if (request.status === 0) {
        reject(new Error('Failed to connect to the server'));
      } else {
        reject(new Error(`Failed to download data (${request.status} ${request.statusText})`));
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to connect to the server'));
    };

    request.send();
  });
}

export function readBlob(blob) {
  log.info(`Reading contents of ${formatSize(blob.size)} blob`);

  return new Promise((resolve, reject) => {
    if (blob.size > BLOB_SIZE_LIMIT) {
      reject(new Error(`Input is too large (${formatSize(blob.size)})`));
      return;
    }
    const reader = new FileReader;
    reader.onload = event => {
      resolve(event.target.result);
    };
    reader.onerror = event => {
      reject(new Error(event.target.error || 'Unknown error'));
    };
    reader.readAsArrayBuffer(blob);
  });
}
