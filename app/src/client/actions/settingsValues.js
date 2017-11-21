import {nes, nesDefaults, MIN_VIDEO_SCALE, MAX_VIDEO_SCALE} from '../common';
import {copyControlsFromNes, copyInputsFromNes} from '../settings';
import {Port, Device, Source, Theme} from '../enums';
import {selectSettingsValues} from '../reducers';

import {
  SET_THEME,
  SET_REGION,
  SET_SPEED,
  SET_VIDEO_RENDERER,
  SET_VIDEO_SCALE,
  SET_VIDEO_PALETTE,
  SET_VIDEO_FILTER,
  SET_VIDEO_DEBUG,
  SET_FULLSCREEN_TYPE,
  SET_FPS_VISIBLE,
  SET_AUDIO_ENABLED,
  SET_AUDIO_VOLUME,
  SET_CONTROLS,
  SET_CONTROLS_DEVICE,
  SET_CONTROLS_INPUTS,
  SET_CONTROLS_VISIBLE,
  SET_CROSSHAIR_VISIBLE,
} from '../actionTypes';

import {createAction} from './utils';

export function switchTheme() {
  return (dispatch, getState) => {
    const {theme} = selectSettingsValues(getState());
    dispatch(createAction(SET_THEME, Theme.getNext(theme)));
  };
}

export function setRegion(region) {
  nes.region = region;
  return createAction(SET_REGION, region);
}

export function setSpeed(speed) {
  nes.speed = speed;
  return createAction(SET_SPEED, speed);
}

export function setVideoRenderer(renderer) {
  nes.video.renderer = renderer;
  return createAction(SET_VIDEO_RENDERER, renderer);
}

export function setVideoScale(scale) {
  nes.video.scale = scale;
  return createAction(SET_VIDEO_SCALE, scale);
}

export function increaseVideoScale() {
  return dispatch => {
    if (nes.video.scale < MAX_VIDEO_SCALE) {
      dispatch(setVideoScale(nes.video.scale + 1));
    }
  };
}

export function decreaseVideoScale() {
  return dispatch => {
    if (nes.video.scale > MIN_VIDEO_SCALE) {
      dispatch(setVideoScale(nes.video.scale - 1));
    }
  };
}

export function setVideoPalette(palette) {
  nes.video.palette = palette;
  return createAction(SET_VIDEO_PALETTE, palette);
}

export function setVideoFilter(filter) {
  nes.video.filter = filter;
  return createAction(SET_VIDEO_FILTER, filter);
}

export function setVideoDebug(debug) {
  nes.video.debug = debug;
  return createAction(SET_VIDEO_DEBUG, debug);
}

export function setFullscreenType(type) {
  nes.fullscreen.type = type;
  return createAction(SET_FULLSCREEN_TYPE, type);
}

export function setFpsVisible(visible) {
  return createAction(SET_FPS_VISIBLE, visible);
}

export function setAudioEnabled(enabled) {
  nes.audio.enabled = enabled;
  return createAction(SET_AUDIO_ENABLED, enabled);
}

export function setAudioVolume(channel, volume) {
  nes.audio.volume[channel] = volume;
  return createAction(SET_AUDIO_VOLUME, {channel, volume});
}

export function resetControls() {
  const {devices, inputs} = nesDefaults;
  nes.use({devices, inputs});
  return createAction(SET_CONTROLS, copyControlsFromNes(nes));
}

export function setControlsDevice(port, device) {
  nes.devices[port] = Device.toOptional(device);
  return createAction(SET_CONTROLS_DEVICE, {port, device});
}

export function addControlsInput(deviceInput) {
  return dispatch => {
    return new Promise(resolve => {
      nes.inputs.record(sourceInputId => {
        if (sourceInputId !== 'keyboard.escape') {
          const deviceInputId = Device.getInputId(deviceInput);
          nes.inputs.map.delete(sourceInputId);
          nes.inputs.map.set(deviceInputId, sourceInputId);
          refreshControlsInputs(dispatch);
        }
        resolve();
      });
    });
  };
}

export function removeControlsInput(sourceInput) {
  return dispatch => {
    nes.inputs.map.delete(Source.getInputId(sourceInput));
    refreshControlsInputs(dispatch);
  };
}

export function bindGamepadToJoypad(index, port) {
  return dispatch => {
    bindGamepadToJoypadButton(index, 'b', port, 'a');
    bindGamepadToJoypadButton(index, 'a', port, 'b');
    bindGamepadToJoypadButton(index, 'start', port, 'start');
    bindGamepadToJoypadButton(index, 'back', port, 'select');
    bindGamepadToJoypadButton(index, 'dpad-left', port, 'left');
    bindGamepadToJoypadButton(index, 'dpad-right', port, 'right');
    bindGamepadToJoypadButton(index, 'dpad-down', port, 'down');
    bindGamepadToJoypadButton(index, 'dpad-up', port, 'up');
    refreshControlsInputs(dispatch);
  };
}

function bindGamepadToJoypadButton(gamepadIndex, gamepadButton, joypadPort, joypadButton) {
  const joypadInput = `${joypadPort}.joypad.${joypadButton}`;
  const gamepadInput = `gamepad${gamepadIndex}.${gamepadButton}`;
  nes.inputs.map.delete(joypadInput);
  nes.inputs.map.delete(gamepadInput);
  nes.inputs.map.set(joypadInput, gamepadInput);
}

function refreshControlsInputs(dispatch) {
  for (const port of Port.values) {
    const inputs = copyInputsFromNes(nes, port);
    dispatch(createAction(SET_CONTROLS_INPUTS, {port, inputs}));
  }
}

export function setControlsVisible(visible) {
  return createAction(SET_CONTROLS_VISIBLE, visible);
}

export function setCrosshairVisible(visible) {
  return createAction(SET_CROSSHAIR_VISIBLE, visible);
}
