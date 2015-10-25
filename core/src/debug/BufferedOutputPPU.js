import PPU from '../units/PPU';
import palette from '../palettes/defaultPalette';
import fs from 'fs';
import { PNG } from 'node-png';
import { VIDEO_WIDTH, VIDEO_HEIGHT } from '../common/constants';
import { unpackColor } from '../utils/colors';
import { newUintArray } from '../utils/system';

//=========================================================
// PPU with output to internal buffer
//=========================================================

export default class NoOutputPPU extends PPU {

  constructor() {
    super();
    this.setPalette(palette);
    this.startFrame(newUintArray(VIDEO_WIDTH * VIDEO_HEIGHT));
  }

  incrementFrame() {
    super.incrementFrame();
    this.startFrame(this.frameBuffer);
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
