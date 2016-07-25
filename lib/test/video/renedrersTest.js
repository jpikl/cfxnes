/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import CanvasRenderer from '../../src/video/renderers/CanvasRenderer';
import WebGLRenderer from '../../src/video/renderers/WebGLRenderer';
import {isRendererSupported, createRenderer} from '../../src/video/renderers';

const renderers = [
  {name: 'canvas', Renderer: CanvasRenderer},
  {name: 'webgl', Renderer: WebGLRenderer},
];

describe('video/renderers', () => {
  it('should detect canvas renderer as always supported', () => {
    expect(isRendererSupported('canvas')).to.be.true;
  });

  it('should detect unknown renderer as not supported', () => {
    expect(isRendererSupported('xxx')).to.be.false;
  });

  for (const {name, Renderer} of renderers) {
    if (isRendererSupported(name)) {
      it(`should create "${name}" renderer`, () => {
        const canvas = document.createElement('canvas');
        expect(createRenderer(name, canvas)).to.be.instanceof(Renderer);
      });
    }
  }

  it('should throw error when creating unknown renderer', () => {
    expect(() => createRenderer(null)).to.throw(Error);
    expect(() => createRenderer('xxx')).to.throw(Error);
  });
});
