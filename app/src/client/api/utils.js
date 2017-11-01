import {log} from '../../common';

export function fetchJson(url) {
  return fetchResource(url).then(response => response.json());
}

function fetchResource(url) {
  log.info(`Fetching ${url}`);
  return fetch(url)
    .catch(error => {
      log.error(error);
      throw new Error('Failed to connect to the server.');
    })
    .then(response => {
      const {ok, status, statusText} = response;
      log.info(`Fetched ${url}: ${status} ${statusText}`);
      if (ok) {
        return response;
      }
      return response.json()
        .catch(error => {
          log.error('Message retrieval from server response failed', error);
        })
        .then(({message}) => {
          if (!message) {
            message = `Failed to download data (${status} ${statusText})`;
          }
          throw new Error(message);
        });
    });
}
