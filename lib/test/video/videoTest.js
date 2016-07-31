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

  it('should have no output', () => {
    expect(video.getOutput()).to.be.null;
  });

  it('should set/get output', () => {
    video.setOutput(document.createElement('canvas'));
    expect(video.getOutput()).to.be.instanceof(HTMLCanvasElement);
  });

  it('should throw error when setting invalid output', () => {
    expect(() => video.setOutput('x')).to.throw(Error);
  });

  it('should have null output rect', () => {
    expect(video.getOutputRect()).to.be.null;
  });

  it('should map mouse coordinates as null', () => {
    expect(video.getOutputCoordinates(10, 20)).to.be.null;
  });

  it('should have webgl renderer by default', () => {
    expect(video.getRenderer()).to.be.equal('webgl');
  });

  for (const name of ['canvas', 'webgl']) {
    it(`should set/get ${name} renderer`, () => {
      video.setRenderer(name);
      expect(video.getRenderer()).to.be.equal(name);
    });
  }

  it('should have fceux palette by defualt', () => {
    expect(video.getPalette()).to.be.equal('fceux');
  });

  it('should set/get palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.be.equal('nestopia-rgb');
  });

  it('should have 1.0 scale by default', () => {
    expect(video.getScale()).to.be.equal(1);
  });

  it('should set/get scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.be.equal(2);
  });

  it('should return max scale', () => {
    expect(video.getMaxScale()).to.be.at.least(1);
  });

  it('should have smoothing disabled by default', () => {
    expect(video.isSmoothing()).to.be.false;
  });

  it('should set/get smoothing', () => {
    video.setSmoothing(true);
    expect(video.isSmoothing()).to.be.true;
    video.setSmoothing(false);
    expect(video.isSmoothing()).to.be.false;
  });

  it('should have debug disabled by default', () => {
    expect(video.isDebug()).to.be.false;
  });

  it('should set/get debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  it('should be not in fullscreen by default', () => {
    expect(video.isFullscreen()).to.be.false;
  });

  it('should throw error when requesting fullscreen enter', () => {
    expect(() => video.enterFullscreen()).to.throw(Error);
  });

  it('should do nothing when requesting fullscreen exit', () => {
    return video.exitFullscreen();
  });

  it('should have maximized fullscreen type by default', () => {
    expect(video.getFullscreenType()).to.be.equal('maximized');
  });

  it('should set/get fullscreen type', () => {
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

  it('should return valid output rect', () => {
    const outputRect = video.getOutputRect();
    const canvasRect = canvas.getBoundingClientRect();
    expect(outputRect).to.deep.equal(canvasRect);
  });

  it('should map mouse coordinates', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('should map mouse coordinates (scale > 1)', () => {
    video.setScale(2);
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 20, top + 40];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('should map mouse coordinates (debug on)', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.be.deep.equal([10, 20]);
  });

  it('should throw error when changing renderer', () => {
    expect(() => video.setRenderer('canvas')).to.throw(Error);
  });

  it('should set/get palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.be.equal('nestopia-rgb');
  });

  it('should set/get scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.be.equal(2);
  });

  it('should set/get smoothing', () => {
    video.setSmoothing(true);
    expect(video.isSmoothing()).to.be.true;
    video.setSmoothing(false);
    expect(video.isSmoothing()).to.be.false;
  });

  it('should set/get debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  isShouldSetValidCanvasSize(1, false, 256, 240);
  isShouldSetValidCanvasSize(1, true, 512, 240);
  isShouldSetValidCanvasSize(2, false, 512, 480);
  isShouldSetValidCanvasSize(2, true, 1024, 480);
  isShouldSetValidCanvasSize(0.5, false, 128, 120);
  isShouldSetValidCanvasSize(0.5, true, 256, 120);

  function isShouldSetValidCanvasSize(scale, debug, width, height) {
    it(`should set valid canvas size (scale: ${scale}, debug: ${debug})`, () => {
      video.setScale(scale);
      video.setDebug(debug);
      expect(canvas.width).to.be.equal(width);
      expect(canvas.height).to.be.equal(height);
    });
  }

  it('should be not in fullscreen by default', () => {
    expect(video.isFullscreen()).to.be.false;
  });

  // Fullscreen is not working with Karma, even if we set client.useIframe = false
  // it('should enter fullscreen after its request', () => {
  //   return video.enterFullscreen().then(() => {
  //     expect(video.isFullscreen()).to.be.true;
  //   });
  // });

  it('should do nothing when requesting fullscreen exit', () => {
    return video.exitFullscreen().then(() => {
      expect(video.isFullscreen()).to.be.false;
    });
  });

  for (const name of ['stretched', 'normalized', 'maximized']) {
    it(`should set/get ${name} fullscreen type`, () => {
      video.setFullscreenType(name);
      expect(video.getFullscreenType()).to.be.equal(name);
    });
  }
});
