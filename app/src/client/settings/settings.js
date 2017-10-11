import {copyControlsFromNes, createDevicesFromControls, createInputsFromControls} from './controls';

export function applySettingsToNes(nes, settings) {
  nes.config.use({
    region: settings.region,
    speed: settings.speed,
    video: {
      renderer: settings.videoRenderer,
      scale: settings.videoScale,
      palette: settings.videoPalette,
      filter: settings.videoFilter,
      debug: settings.videoDebug,
    },
    fullscreen: {
      type: settings.fullscreenType,
    },
    audio: {
      enabled: settings.audioEnabled,
      volume: settings.audioVolume,
    },
    devices: createDevicesFromControls(settings.controls),
    inputs: createInputsFromControls(settings.controls),
  });
}

export function copySettingsFromNes(nes) {
  return {
    region: nes.region,
    speed: nes.speed,
    videoRenderer: nes.video.renderer,
    videoScale: nes.video.scale,
    videoPalette: nes.video.palette,
    videoFilter: nes.video.filter,
    videoDebug: nes.video.debug,
    fullscreenType: nes.fullscreen.type,
    audioEnabled: nes.audio ? nes.audio.enabled : false,
    audioVolume: nes.audio ? {...nes.audio.volume} : {},
    controls: copyControlsFromNes(nes),
  };
}
