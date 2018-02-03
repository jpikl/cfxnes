import {log} from '../../../core';

const BUFFER_SIZE = 4096;
const SAMPLE_RATE_ADJUSTMENT_FACTOR = 100; // How much do we adjust sample rate

export default class Processor {

  constructor(nes, context) {
    log.info('Initializing audio processor');

    this.nes = nes;

    this.processorNode = context.createScriptProcessor(BUFFER_SIZE, 0, 1); // 0 input channels, 1 output channel
    this.processorNode.onaudioprocess = event => this.emptyOutputBuffer(event.outputBuffer);

    this.lastSample = 0; // The last received audio sample
    this.receiveSample = this.receiveSample.bind(this);

    this.recordPosition = 0; // Position of the next sample in the record buffer
    this.recordBuffer = new Float32Array(BUFFER_SIZE); // Buffer where audio samples are being stored
    this.outputBuffer = new Float32Array(BUFFER_SIZE); // Buffer with audio samples ready to output
    this.outputBufferFull = false; // Whether the output buffer is full
  }

  connect(destination) {
    log.info('Connecting audio processor');
    this.nes.setAudioCallback(this.receiveSample);
    this.processorNode.connect(destination);
  }

  disconnect() {
    log.info('Disconnecting audio processor');
    this.nes.setAudioCallback(null);
    this.processorNode.disconnect();
  }

  setSampleRate(rate) {
    log.info(`Setting sample rate to ${rate} Hz`);
    this.nes.setAudioSampleRate(rate);
  }

  receiveSample(sample) {
    if (this.recordPosition === BUFFER_SIZE) {
      if (this.outputBufferFull) {
        return; // Buffer overflow
      }
      this.swapBuffers();
    }
    this.recordBuffer[this.recordPosition++] = sample;
    this.lastSample = sample;
  }

  emptyOutputBuffer(targetBuffer) {
    if (!this.outputBufferFull) {
      this.recordBuffer.fill(this.lastSample, this.recordPosition); // Buffer underflow
      this.swapBuffers();
    }

    if (targetBuffer.copyToChannel) {
      targetBuffer.copyToChannel(this.outputBuffer, 0);
    } else {
      targetBuffer.getChannelData(0).set(this.outputBuffer); // copyToChannel is not implemented in all browsers yet
    }

    this.outputBufferFull = false;
    this.adjustSampleRate();
  }

  swapBuffers() {
    [this.outputBuffer, this.recordBuffer] = [this.recordBuffer, this.outputBuffer];
    this.outputBufferFull = true;
    this.recordPosition = 0;
  }

  adjustSampleRate() {
    // Our goal is to have right now about 50% of data in buffer
    const percentageDifference = 0.5 - (this.recordPosition / BUFFER_SIZE); // Difference from the expected value
    const sampleRateAdjustment = SAMPLE_RATE_ADJUSTMENT_FACTOR * percentageDifference;
    this.nes.setAudioSampleRate(this.nes.getAudioSampleRate() + sampleRateAdjustment);
  }

}
