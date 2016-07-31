import {formatSize} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

export function fetchURL(url) {
  log.info(`Fetching data from "${url}"`);
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest;
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      if (request.status === 200) {
        resolve(request.response);
      } else if (request.status === 0) {
        reject(new Error('Unable to connect to the server'));
      } else {
        reject(new Error(`Unable to download file (${request.status} ${request.statusText})`));
      }
    };
    request.onerror = () => {
      reject(new Error('Unable to connect to the server'));
    };
    request.send();
  });
}

export function readFile(file) {
  log.info(`Reading contents of ${formatSize(file.size)} file`);
  return new Promise((resolve, reject) => {
    if (file.size > FILE_SIZE_LIMIT) {
      reject(new Error(`Input file is too large (${formatSize(file.size)})`));
      return;
    }
    const reader = new FileReader;
    reader.onload = event => {
      resolve(event.target.result);
    };
    reader.onerror = event => {
      reject(new Error(event.target.error || 'Unknown error'));
    };
    reader.readAsArrayBuffer(file);
  });
}
