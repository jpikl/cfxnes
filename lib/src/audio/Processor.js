import {log} from '../../../core/src/common';

export default class Processor {

  constructor(nes, context) {
    log.info('Initializing audio processor');
    this.nes = nes;
    this.processorNode = context.createScriptProcessor(4096, 0, 1); // 4K buffer, 0 input channels, 1 output channel
    this.processorNode.onaudioprocess = event => this.update(event);
    this.nes.setAudioBufferSize(this.processorNode.bufferSize);
  }

  update(event) {
    const {outputBuffer} = event;
    const sourceBuffer = this.nes.readAudioBuffer();
    outputBuffer.getChannelData(0).set(sourceBuffer); // copyToChannel is not implemented in all browsers yet
  }

  setMixer(mixer) {
    if (mixer) {
      log.info('Connecing audio processor to mixer');
      this.processorNode.connect(mixer.gainNode);
    } else {
      log.info('Disconnecting audio processor from mixer');
      this.processorNode.disconnect();
    }
  }

}
