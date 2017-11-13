import {expect} from 'chai';
import {INDEX_HTML_PATH, BUNDLE_CSS_PATH} from './fixtures';
import {createRequest, handleRequestError, getFileContent} from './utils';

const TEXT_HTML = 'text/html; charset=UTF-8';
const TEXT_CSS = 'text/css; charset=UTF-8';

function testGetRequest(url, contentType, content) {
  return createRequest()
    .get(url)
    .catch(handleRequestError)
    .then(response => {
      expect(response).to.have.status(200);
      expect(response).to.have.header('Content-Type', contentType);
      expect(response).to.have.header('X-Content-Type-Options', 'nosniff');
      expect(response).not.to.have.header('X-Powered-By');
      expect(response.text).to.equal(content);
    });
}

describe('Server', () => {
  let indexHtmlContent;
  let bundleCssContent;

  before(() => {
    indexHtmlContent = getFileContent(INDEX_HTML_PATH);
    bundleCssContent = getFileContent(BUNDLE_CSS_PATH);
  });

  it('returns index.html', () => {
    return Promise.all([
      testGetRequest('', TEXT_HTML, indexHtmlContent),
      testGetRequest('/', TEXT_HTML, indexHtmlContent),
      testGetRequest('/index.html', TEXT_HTML, indexHtmlContent),
    ]);
  });

  it('returns index.html as fallback', () => {
    return testGetRequest('/settings/system', TEXT_HTML, indexHtmlContent);
  });

  it('returns bundle.css', () => {
    return testGetRequest('/bundle.css', TEXT_CSS, bundleCssContent);
  });
});
