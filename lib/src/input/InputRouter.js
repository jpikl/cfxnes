import {log} from '../../../core';
import {MOUSE, MOUSE_CURSOR} from './sources';
import {ZAPPER, ZAPPER_BEAM} from './devices';
import ports from './ports';

export default class InputRouter {

  constructor(map, devices, video) {
    log.info('Initializing input router');
    this.map = map;
    this.devices = devices;
    this.video = video;
    this.mouseCursor = null; // Current mouse coordinates
  }

  routeInput(srcInput, value) {
    if (srcInput.source === MOUSE) {
      if (this.video.getOutput() == null) {
        return false; // Ignore mouse inputs when there is no canvas
      }
      if (srcInput.name === MOUSE_CURSOR) {
        this.mouseCursor = value;
        value = this.video.getOutputCoordinates(value[0], value[1]);
        for (const port of ports) {
          this.devices.setRawInput(port, ZAPPER, ZAPPER_BEAM, value);
        }
        return true;
      }
      if (this.mouseCursor) {
        const [x, y] = this.mouseCursor;
        const {top, bottom, left, right} = this.video.getOutputRect();
        if (x < left || x > right || y < top || y > bottom) {
          return false; // Ignore mouse clicks outside canvas
        }
      }
    }
    let processed = false;
    this.map.forEach(srcInput, devInput => {
      const {port, device, name} = devInput;
      this.devices.setRawInput(port, device, name, value);
      processed = true;
    });
    return processed;
  }

}
