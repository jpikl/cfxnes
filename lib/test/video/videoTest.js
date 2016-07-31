/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import Video from '../../src/video/Video';

describe('video/Video (no canvas)', () => {
  let video;

  beforeEach(() => {
    video = new Video(new NES, {});
  });

  it('has no output set by defaul', () => {
    expect(video.getOutput()).to.be.null;
  });

  it('sets/gets output', () => {
    video.setOutput(document.createElement('canvas'));
    expect(video.getOutput()).to.be.instanceof(HTMLCanvasElement);
  });

  it('throws error for invalid output', () => {
    expect(() => video.setOutput('x')).to.throw(Error);
  });

  it('has null output rect', () => {
    expect(video.getOutputRect()).to.be.null;
  });

  it('maps mouse coordinates to null', () => {
    expect(video.getOutputCoordinates(10, 20)).to.be.null;
  });

  it('has webgl renderer set by default', () => {
    expect(video.getRenderer()).to.be.equal('webgl');
  });

  for (const name of ['canvas', 'webgl']) {
    it(`sets/gets "${name}" renderer`, () => {
      video.setRenderer(name);
      expect(video.getRenderer()).to.be.equal(name);
    });
  }

  it('has "fceux" palette set by defualt', () => {
    expect(video.getPalette()).to.be.equal('fceux');
  });

  it('sets/gets palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.be.equal('nestopia-rgb');
  });

  it('has 1.0 scale set by default', () => {
    expect(video.getScale()).to.be.equal(1);
  });

  it('sets/gets scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.be.equal(2);
  });

  it('gets maximum scale', () => {
    expect(video.getMaxScale()).to.be.at.least(1);
  });

  it('has smoothing disabled by default', () => {
    expect(video.isSmoothing()).to.be.false;
  });

  it('sets/gets smoothing', () => {
    video.setSmoothing(true);
    expect(video.isSmoothing()).to.be.true;
    video.setSmoothing(false);
    expect(video.isSmoothing()).to.be.false;
  });

  it('has debug disabled by default', () => {
    expect(video.isDebug()).to.be.false;
  });

  it('sets/gets debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  it('is not in fullscreen by default', () => {
    expect(video.isFullscreen()).to.be.false;
  });

  it('throws error when requesting fullscreen enter', () => {
    expect(() => video.enterFullscreen()).to.throw(Error);
  });

  it('does nothing when requesting fullscreen exit', () => {
    return video.exitFullscreen();
  });

  it('has "maximized" fullscreen type by default', () => {
    expect(video.getFullscreenType()).to.be.equal('maximized');
  });

  it('sets/gets fullscreen type', () => {
    video.setFullscreenType('normalized');
    expect(video.getFullscreenType()).to.be.equal('normalized');
  });
});

describe('video/Video (canvas set)', () => {
  let video, canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    video = new Video(new NES, {});
    video.setOutput(canvas);
  });

  afterEach(() => {
    document.body.removeChild(canvas);
  });

  it('gets valid output rect', () => {
    const outputRect = video.getOutputRect();
    const canvasRect = canvas.getBoundingClientRect();
    expect(outputRect).to.deep.equal(canvasRect);
  });

  it('maps mouse coordinates', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('maps mouse coordinates (scale > 1)', () => {
    video.setScale(2);
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 20, top + 40];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('maps mouse coordinates (debug enabled)', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('throws error when changing renderer', () => {
    expect(() => video.setRenderer('canvas')).to.throw(Error);
  });

  it('sets/gets palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.be.equal('nestopia-rgb');
  });

  it('sets/gets scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.be.equal(2);
  });

  it('sets/gets smoothing', () => {
    video.setSmoothing(true);
    expect(video.isSmoothing()).to.be.true;
    video.setSmoothing(false);
    expect(video.isSmoothing()).to.be.false;
  });

  it('sets/gets debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  isUsesCorrectCanvasSize(1, false, 256, 240);
  isUsesCorrectCanvasSize(1, true, 512, 240);
  isUsesCorrectCanvasSize(2, false, 512, 480);
  isUsesCorrectCanvasSize(2, true, 1024, 480);
  isUsesCorrectCanvasSize(0.5, false, 128, 120);
  isUsesCorrectCanvasSize(0.5, true, 256, 120);

  function isUsesCorrectCanvasSize(scale, debug, width, height) {
    it(`uses correct canvas size (scale: ${scale}, debug: ${debug})`, () => {
      video.setScale(scale);
      video.setDebug(debug);
      expect(canvas.width).to.be.equal(width);
      expect(canvas.height).to.be.equal(height);
    });
  }

  it('is not in fullscreen by default', () => {
    expect(video.isFullscreen()).to.be.false;
  });

  // Fullscreen is not working with Karma, even if we set client.useIframe = false
  // it('enters fullscreen after request', () => {
  //   return video.enterFullscreen().then(() => {
  //     expect(video.isFullscreen()).to.be.true;
  //   });
  // });

  it('does nothing when requesting fullscreen exit', () => {
    return video.exitFullscreen().then(() => {
      expect(video.isFullscreen()).to.be.false;
    });
  });

  for (const name of ['stretched', 'normalized', 'maximized']) {
    it(`sets/gets "${name}" fullscreen type`, () => {
      video.setFullscreenType(name);
      expect(video.getFullscreenType()).to.be.equal(name);
    });
  }
});
