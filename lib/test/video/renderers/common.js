/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

export function itShouldPassRendererTests(Renderer) {
  function createRenderer() {
    const canvas = document.createElement('canvas');
    return new Renderer(canvas);
  }

  it('should initialize', () => {
    createRenderer();
  });

  it('should create frame of valid size and type', () => {
    const renderer = createRenderer();
    const frame = renderer.createFrame(0, 0, 256, 240);
    expect(frame.data).to.be.an('uint32array');
    expect(frame.data.length).to.be.at.least(256 * 240); // Can be larger due to padding
  });

  for (const smoothing of [false, true]) {
    for (const scale of [1, 0.5, 2.0]) {
      it(`should render frame (smoothing: ${smoothing}, scale: ${scale})`, () => {
        const renderer = createRenderer();
        const frame = renderer.createFrame(0, 0, 256, 240);
        renderer.setSmoothing(smoothing);
        renderer.setScale(scale);
        renderer.begin();
        renderer.drawFrame(frame);
        renderer.end();
      });
    }
  }
}
