import fs from 'fs';
import {PNG} from 'node-png';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../constants';
import {createPalette} from '../palettes';
import {unpackColor} from '../utils/color';
import PPU from '../units/PPU';

//=========================================================
// PPU with output to internal buffer
//=========================================================

export default class BufferedOutputPPU extends PPU {

  constructor() {
    super();
    this.dependencies = ['cpu', 'ppuMemory'];
  }

  inject(cpu, ppuMemory) {
    super.inject(cpu, ppuMemory);
    this.setPalette(createPalette('fceux'));
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
