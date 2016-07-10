import log from '../../../core/src/common/log';
import {PORTS} from './common';

export default class InputRouter {

  constructor(mapper, devices, video) {
    log.info('Initializing input router');
    this.mapper = mapper;
    this.devices = devices;
    this.video = video;
  }

  routeInput(srcInput, value) {
    if (srcInput.source === 'mouse' && srcInput.name === 'cursor') {
      value = this.video.mouseToOutputCoordinates(value[0], value[1]);
      for (const port of PORTS) {
        this.devices.updateInput(port, 'zapper', 'beam', value);
      }
      return true;
    }
    let result = false;
    this.mapper.forEachMatch(srcInput, devInput => {
      const {port, device, name} = devInput;
      this.devices.updateInput(port, device, name, value);
      result = true;
    });
    return result;
  }

}
