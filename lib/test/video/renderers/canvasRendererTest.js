/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import CanvasRenderer from '../../../src/video/renderers/CanvasRenderer';
import {itPassesRendererTests} from './common';

describe('video/renderers/CanvasRenderer', () => {
  it('is always supported', () => {
    expect(CanvasRenderer.isSupported()).to.be.true;
  });

  itPassesRendererTests(CanvasRenderer);
});
