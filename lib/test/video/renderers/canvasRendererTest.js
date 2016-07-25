/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import CanvasRenderer from '../../../src/video/renderers/CanvasRenderer';
import {itShouldPassRendererTests} from './common';

describe('video/renderers/CanvasRenderer', () => {
  it('should be always supported', () => {
    expect(CanvasRenderer.isSupported()).to.be.true;
  });

  itShouldPassRendererTests(CanvasRenderer);
});
