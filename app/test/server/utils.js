import fs from 'fs';
import chai from 'chai';
import {getServer} from './fixtures';

export function createRequest() {
  return chai.request(getServer());
}

export function handleRequestError(error) {
  const {response} = error;
  if (response) {
    return response;
  }
  throw error;
}

export function getFileSize(path) {
  return fs.statSync(path).size;
}

export function getFileContent(path) {
  return fs.readFileSync(path, 'utf-8');
}
