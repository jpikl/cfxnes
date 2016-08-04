/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import CanvasRenderer from '../../src/video/renderers/CanvasRenderer';
import WebGLRenderer from '../../src/video/renderers/WebGLRenderer';
import {isRendererSupported, isRendererName, createRenderer} from '../../src/video/renderers';

const renderers = [
  {name: 'canvas', Renderer: CanvasRenderer},
  {name: 'webgl', Renderer: WebGLRenderer},
];

describe('video/renderers', () => {
  it('detects canvas renderer as supported', () => {
    expect(isRendererSupported('canvas')).to.be.true;
  });

  it('detects unknown renderer as not supported', () => {
    expect(isRendererSupported('x')).to.be.false;
  });

  it('validates renderer name', () => {
    expect(isRendererName('x')).to.be.false;
    expect(isRendererName('canvas')).to.be.true;
  });

  for (const {name, Renderer} of renderers) {
    if (isRendererSupported(name)) {
      it(`creates "${name}" renderer`, () => {
        const canvas = document.createElement('canvas');
        expect(createRenderer(name, canvas)).to.be.instanceof(Renderer);
      });
    }
  }

  it('throws error when creating invalid renderer', () => {
    expect(() => createRenderer()).to.throw('Invalid renderer');
    expect(() => createRenderer('x')).to.throw('Invalid renderer');
  });
});
