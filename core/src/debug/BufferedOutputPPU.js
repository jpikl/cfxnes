import PPU from '../units/PPU';
import fs from 'fs';
import {PNG} from 'node-png';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../common/constants';
import {unpackColor} from '../utils/colors';
import {newUintArray} from '../utils/system';

//=========================================================
// PPU with output to internal buffer
//=========================================================

export default class BufferedOutputPPU extends PPU {

  constructor() {
    super();
    this.dependencies = ['cpu', 'ppuMemory', 'paletteFactory'];
  }

  inject(cpu, ppuMemory, paletteFactory) {
    super.inject(cpu, ppuMemory);
    this.setPalette(paletteFactory.createPalette('fceux'));
    this.setFrameBuffer(newUintArray(VIDEO_WIDTH * VIDEO_HEIGHT));
  }

  writeFrameToFile(file) {
    return new Promise(resolve => {
      var png = new PNG({width: VIDEO_WIDTH, height: VIDEO_HEIGHT});
      for (var srcPos = 0, dstPos = 0; srcPos < this.frameBuffer.length; srcPos++) {
        var [r, g, b] = unpackColor(this.frameBuffer[srcPos]);
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
