import {NES} from '../../../core';
import Video from '../../src/video/Video';

describe('video/Video (no canvas)', () => {
  let video;

  beforeEach(() => {
    video = new Video(new NES, {});
  });

  it('has no output set by default', () => {
    expect(video.getOutput()).to.be.null;
  });

  it('changes output', () => {
    const canvas = document.createElement('canvas');
    video.setOutput(canvas);
    expect(video.getOutput()).to.equal(canvas);
  });

  it('throws error when setting invalid output', () => {
    expect(() => video.setOutput()).to.throw('Invalid video output: undefined');
    expect(() => video.setOutput(1)).to.throw('Invalid video output: 1');
  });

  it('has null output rect', () => {
    expect(video.getOutputRect()).to.be.null;
  });

  it('maps mouse coordinates to null', () => {
    expect(video.getOutputCoordinates(10, 20)).to.be.null;
  });

  it('has webgl renderer set by default', () => {
    expect(video.getRenderer()).to.equal('webgl');
  });

  for (const name of ['canvas', 'webgl']) {
    it(`changes renderer to "${name}"`, () => {
      video.setRenderer(name);
      expect(video.getRenderer()).to.equal(name);
    });
  }

  it('throws error when setting invalid renderer', () => {
    expect(() => video.setRenderer()).to.throw('Invalid video renderer: undefined');
    expect(() => video.setRenderer('x')).to.throw('Invalid video renderer: "x"');
  });

  it('throws error when clearing output', () => {
    expect(() => video.clearFrame()).to.throw('No video output');
  });

  it('has "fceux" palette set by default', () => {
    expect(video.getPalette()).to.equal('fceux');
  });

  it('changes palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.equal('nestopia-rgb');
  });

  it('throws error when setting invalid palette', () => {
    expect(() => video.setPalette()).to.throw('Invalid video palette: undefined');
    expect(() => video.setPalette('x')).to.throw('Invalid video palette: "x"');
  });

  it('has 1.0 scale set by default', () => {
    expect(video.getScale()).to.equal(1);
  });

  it('changes scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.equal(2);
  });

  it('throws error when setting invalid scale', () => {
    expect(() => video.setScale()).to.throw('Invalid video scale: undefined');
    expect(() => video.setScale('x')).to.throw('Invalid video scale: "x"');
    expect(() => video.setScale(0)).to.throw('Invalid video scale: 0');
    expect(() => video.setScale(-1)).to.throw('Invalid video scale: -1');
  });

  it('has "nearest" filter by default', () => {
    expect(video.getFilter()).to.equal('nearest');
  });

  it('changes filter', () => {
    video.setFilter('linear');
    expect(video.getFilter()).to.equal('linear');
    video.setFilter('nearest');
    expect(video.getFilter()).to.equal('nearest');
  });

  it('throws error when setting invalid filter', () => {
    expect(() => video.setFilter()).to.throw('Invalid video filter: undefined');
    expect(() => video.setFilter('x')).to.throw('Invalid video filter: "x"');
  });

  it('has debug disabled by default', () => {
    expect(video.isDebug()).to.be.false;
  });

  it('changes debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  it('throws error when setting invalid debug', () => {
    expect(() => video.setDebug()).to.throw('Invalid video debug: undefined');
    expect(() => video.setDebug('x')).to.throw('Invalid video debug: "x"');
  });

  it('is not in fullscreen by default', () => {
    expect(video.isFullscreen()).to.be.false;
  });

  it('throws error when requesting fullscreen enter', () => {
    expect(() => video.enterFullscreen()).to.throw('No video output');
  });

  it('does nothing when requesting fullscreen exit', () => {
    return video.exitFullscreen();
  });

  it('has "maximized" fullscreen type by default', () => {
    expect(video.getFullscreenType()).to.equal('maximized');
  });

  it('changes fullscreen type', () => {
    video.setFullscreenType('normalized');
    expect(video.getFullscreenType()).to.equal('normalized');
  });

  it('throws error when setting invalid fullscreen type', () => {
    expect(() => video.setFullscreenType()).to.throw('Invalid fullscreen type: undefined');
    expect(() => video.setFullscreenType('x')).to.throw('Invalid fullscreen type: "x"');
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

  it('changes output to null', () => {
    video.setOutput(null);
    expect(video.getOutput()).to.be.null;
  });

  it('returns valid output rect', () => {
    const outputRect = video.getOutputRect();
    const canvasRect = canvas.getBoundingClientRect();
    expect(outputRect).to.deep.equal(canvasRect);
  });

  it('maps mouse coordinates', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.deep.equal([10, 20]);
  });

  it('maps mouse coordinates (scale > 1)', () => {
    video.setScale(2);
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 20, top + 40];
    expect(video.getOutputCoordinates(...cursor)).to.deep.equal([10, 20]);
  });

  it('maps mouse coordinates (debug enabled)', () => {
    const {top, left} = canvas.getBoundingClientRect();
    const cursor = [left + 10, top + 20];
    expect(video.getOutputCoordinates(...cursor)).to.deep.equal([10, 20]);
  });

  it('throws error when changing renderer', () => {
    expect(() => video.setRenderer('canvas')).to.throw('Cannot change video renderer once output is set');
  });

  it('clears output without error', () => {
    video.clearFrame();
  });

  it('changes palette', () => {
    video.setPalette('nestopia-rgb');
    expect(video.getPalette()).to.equal('nestopia-rgb');
  });

  it('changes scale', () => {
    video.setScale(2);
    expect(video.getScale()).to.equal(2);
  });

  it('changes filter', () => {
    video.setFilter('linear');
    expect(video.getFilter()).to.equal('linear');
    video.setFilter('nearest');
    expect(video.getFilter()).to.equal('nearest');
  });

  it('changes debug', () => {
    video.setDebug(true);
    expect(video.isDebug()).to.be.true;
    video.setDebug(false);
    expect(video.isDebug()).to.be.false;
  });

  itUsesCorrectCanvasSize(1, false, 256, 240);
  itUsesCorrectCanvasSize(1, true, 512, 240);
  itUsesCorrectCanvasSize(2, false, 512, 480);
  itUsesCorrectCanvasSize(2, true, 1024, 480);
  itUsesCorrectCanvasSize(0.5, false, 128, 120);
  itUsesCorrectCanvasSize(0.5, true, 256, 120);

  function itUsesCorrectCanvasSize(scale, debug, width, height) {
    it(`uses correct canvas size (scale: ${scale}, debug: ${debug})`, () => {
      video.setScale(scale);
      video.setDebug(debug);
      expect(canvas.width).to.equal(width);
      expect(canvas.height).to.equal(height);
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
    it(`changes fullscreen type to "${name}"`, () => {
      video.setFullscreenType(name);
      expect(video.getFullscreenType()).to.equal(name);
    });
  }
});
