import Canvas2dRenderer from '../../src/video/renderers/Canvas2dRenderer';
import WebGlRenderer from '../../src/video/renderers/WebGlRenderer';
import {isRendererName, createRenderer} from '../../src/video/renderers';

const renderers = [
  {name: 'canvas', className: 'Canvas2dRenderer', Renderer: Canvas2dRenderer},
  {name: 'webgl', className: 'WebGlRenderer', Renderer: WebGlRenderer},
];

describe('video/renderers', () => {
  it('validates renderer name', () => {
    expect(isRendererName('x')).to.be.false;
    expect(isRendererName('canvas')).to.be.true;
  });

  for (const {name, Renderer} of renderers) {
    it(`creates "${name}" renderer`, () => {
      const canvas = document.createElement('canvas');
      expect(createRenderer(name, canvas)).to.be.instanceOf(Renderer);
    });
  }

  it('throws error when creating invalid renderer', () => {
    expect(() => createRenderer()).to.throw('Invalid renderer: undefined');
    expect(() => createRenderer('x')).to.throw('Invalid renderer: "x"');
  });
});

for (const {className, Renderer} of renderers) {
  describe(`video/renderers/${className}`, () => {
    let canvas, canInitialize = false;

    beforeEach(() => {
      canvas = document.createElement('canvas');
    });

    it('initializes without error', () => {
      expect(new Renderer(canvas)).to.be.an('object');
      canInitialize = true;
    });

    it('creates frame of valid size and type', function() {
      if (canInitialize) {
        const renderer = new Renderer(canvas);
        const frame = renderer.createFrame(0, 0, 256, 240);
        expect(frame.data).to.be.an('Uint32Array')
          .with.lengthOf.at.least(256 * 240); // Can be larger due to padding
      } else {
        this.skip();
      }
    });

    for (const filter of ['nearest', 'linear']) {
      for (const scale of [1, 0.5, 2.0]) {
        it(`renders frame (filter: ${filter}, scale: ${scale})`, function() {
          if (canInitialize) {
            const renderer = new Renderer(canvas);
            const frame = renderer.createFrame(0, 0, 256, 240);
            renderer.setFilter(filter);
            renderer.setScale(scale);
            renderer.begin();
            renderer.drawFrame(frame);
            renderer.end();
          } else {
            this.skip();
          }
        });
      }
    }
  });
}
