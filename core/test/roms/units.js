import fs from 'fs';
import {PNG} from 'node-png';

import {
  CPU,
  PPU,
  APU,
  unpackColor,
  createPalette,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from '../../src';

export {CPU, PPU, APU};

export class MemoryOutputPPU extends PPU {

  connect(nes) {
    super.connect(nes);
    this.setBasePalette(createPalette());
    this.setFrameBuffer(new Uint32Array(VIDEO_WIDTH * VIDEO_HEIGHT));
  }

  writeFrameToFile(file) {
    return new Promise(resolve => {
      const png = new PNG({width: VIDEO_WIDTH, height: VIDEO_HEIGHT});
      for (let srcPos = 0, dstPos = 0; srcPos < this.frameBuffer.length; srcPos++) {
        const [r, g, b] = unpackColor(this.frameBuffer[srcPos]);
        png.data[dstPos++] = r;
        png.data[dstPos++] = g;
        png.data[dstPos++] = b;
        png.data[dstPos++] = 255;
      }
      png.pack()
        .pipe(fs.createWriteStream(file))
        .on('finish', resolve);
    });
  }

}

export class NoOutputPPU extends PPU {

  constructor() {
    super();
    this.setFrameBuffer([]); // This surprisingly makes execution in Node.js faster, although the buffer isn't accessed at all
  }

  updatePalette() {
  }

  setFramePixel() {
  }

  clearFramePixel() {
  }

}

export class DisabledPPU extends PPU {

  tick() {
    // For faster execution when PPU is not needed
  }

  updatePalette() {
  }

}

export class DisabledAPU extends APU {

  tick() {
    // For faster execution when APU is not needed
  }

}
