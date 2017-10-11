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
  SET_CONTROLS_INPTUS,
  SET_CONTROLS_VISIBLE,
} from '../actionTypes';

import {createReducer} from './common';

const actionHandlers = {
  [SET_THEME]: (state, theme) => ({...state, theme}),
  [SET_REGION]: (state, region) => ({...state, region}),
  [SET_SPEED]: (state, speed) => ({...state, speed}),
  [SET_VIDEO_RENDERER]: (state, videoRenderer) => ({...state, videoRenderer}),
  [SET_VIDEO_SCALE]: (state, videoScale) => ({...state, videoScale}),
  [SET_VIDEO_PALETTE]: (state, videoPalette) => ({...state, videoPalette}),
  [SET_VIDEO_FILTER]: (state, videoFilter) => ({...state, videoFilter}),
  [SET_VIDEO_DEBUG]: (state, videoDebug) => ({...state, videoDebug}),
  [SET_FULLSCREEN_TYPE]: (state, fullscreenType) => ({...state, fullscreenType}),
  [SET_FPS_VISIBLE]: (state, fpsVisible) => ({...state, fpsVisible}),
  [SET_AUDIO_ENABLED]: (state, audioEnabled) => ({...state, audioEnabled}),
  [SET_AUDIO_VOLUME]: (state, {channel, volume}) => {
    const {audioVolume} = state;
    return {...state, audioVolume: {...audioVolume, [channel]: volume}};
  },
  [SET_CONTROLS]: (state, controls) => ({...state, controls}),
  [SET_CONTROLS_DEVICE]: (state, {port, device}) => {
    const {controls} = state;
    const {inputs} = controls[port];
    return {...state, controls: {...controls, [port]: {device, inputs}}};
  },
  [SET_CONTROLS_INPTUS]: (state, {port, inputs}) => {
    const {controls} = state;
    const {device} = controls[port];
    return {...state, controls: {...controls, [port]: {device, inputs}}};
  },
  [SET_CONTROLS_VISIBLE]: (state, controlsVisible) => ({...state, controlsVisible}),
};

export default createReducer(actionHandlers);
