/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import WebGLRenderer from '../../../src/video/renderers/WebGLRenderer';
import {itShouldPassRendererTests} from './common';

describe('video/renderers/WebGLRenderer', () => {
  it('should be supported when WebGL is available', () => {
    expect(WebGLRenderer.isSupported()).to.be.equal(window.WebGLRenderingContext != null);
  });

  if (WebGLRenderer.isSupported()) {
    itShouldPassRendererTests(WebGLRenderer);
  }
});
