import {expect} from 'chai';
import {createRequest, handleRequestError, getFileSize} from '../utils';
import {NESTEST_ROM_PATH, NESTEST_THUMB_PATH, roms} from '../fixtures';

describe('ROMs API', () => {
  describe('GET /api/roms/', () => {
    it('returns list of ROMs', () => {
      return createRequest()
        .get('/api/roms/')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(200);
          expect(response).to.be.json;
          expect(response.body).to.deep.equal(roms.all);
        });
    });
  });

  describe('GET /api/roms/:id', () => {
    it('returns ROM with ID', () => {
      return createRequest()
        .get('/api/roms/nes-test')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(200);
          expect(response).to.be.json;
          expect(response.body).to.deep.equal(roms.nestest);
        });
    });

    it('returns 404 for nonexistent ROM', () => {
      return createRequest()
        .get('/api/roms/xxx')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(404);
          expect(response).to.be.json;
          expect(response.body).to.deep.equal({message: 'ROM xxx not found.'});
        });
    });
  });

  describe('GET /api/roms/files/:name', () => {
    it('returns ROM file with name', () => {
      return createRequest()
        .get('/api/roms/files/NES_Test.nes')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(200);
          expect(response).to.have.header('Content-Type', 'application/octet-stream');
          expect(response).to.have.header('Content-Length', getFileSize(NESTEST_ROM_PATH));
        });
    });

    it('returns ROM thumbnail with name', () => {
      return createRequest()
        .get('/api/roms/files/NES_Test.jpg')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(200);
          expect(response).to.have.header('Content-Type', 'image/jpeg');
          expect(response).to.have.header('Content-Length', getFileSize(NESTEST_THUMB_PATH));
        });
    });

    it('returns 404 for nonexistent file', () => {
      return createRequest()
        .get('/api/roms/files/xxx')
        .catch(handleRequestError)
        .then(response => {
          expect(response).to.have.status(404);
          expect(response).to.be.json;
          expect(response.body).to.deep.equal({message: 'File xxx not found.'});
        });
    });
  });
});
