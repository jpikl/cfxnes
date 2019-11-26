import fs from 'fs';
import {PNG} from 'node-png';

import {
  Cpu,
  Ppu,
  Apu,
  unpackColor,
  createPalette,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from '../../src';

export {Cpu, Ppu, Apu};

export class MemoryOutputPpu extends Ppu {

  connect(bus) {
    super.connect(bus);
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

export class NoOutputPpu extends Ppu {

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

export class DisabledPpu extends Ppu {

  tick() {
    // For faster execution when PPU is not needed
  }

  updatePalette() {
  }

}

export class DisabledApu extends Apu {

  tick() {
    // For faster execution when APU is not needed
  }

}
