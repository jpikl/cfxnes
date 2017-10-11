import {nes} from '../common';
import {romsApi} from '../api';
import {loadNVRAM, saveNVRAM} from '../nvram';

import {
  START_ROM_LOAD,
  FINISH_ROM_LOAD,
  CLEAR_ROM_LOAD_ERROR,
  SET_EMULATOR_RUNNING,
  SET_EMULATOR_SUSPENDED,
} from '../actionTypes';

import {selectEmulator, selectLibrary} from '../reducers';
import {createAction} from './common';

export function connectEmulator(canvas) {
  return (dispatch, getState) => {
    nes.video.output = canvas;
    const {suspended} = selectEmulator(getState());
    if (suspended) {
      dispatch(resumeEmulator());
    } else if (nes.rom.loaded) {
      nes.step(); // To refresh canvas
    }
  };
}

export function disconnectEmulator() {
  return dispatch => {
    dispatch(suspendEmulator());
    nes.video.output = null;
  };
}

export function resumeEmulator() {
  return dispatch => {
    dispatch(startEmulator());
    dispatch(createAction(SET_EMULATOR_SUSPENDED, false));
  };
}

export function suspendEmulator() {
  return dispatch => {
    const {running} = nes;
    dispatch(stopEmulator());
    dispatch(createAction(SET_EMULATOR_SUSPENDED, running));
  };
}

export function startEmulator() {
  nes.start();
  return createAction(SET_EMULATOR_RUNNING, true);
}

export function stopEmulator() {
  nes.stop();
  return createAction(SET_EMULATOR_RUNNING, false);
}

export function powerEmulator() {
  return () => nes.power();
}

export function resetEmulator() {
  return () => nes.reset();
}

export function fetchAndloadROM(romId) {
  return executeROMLoad(romId, getState => {
    return fetchROM(romId, getState)
      .then(({file}) => nes.rom.load(file));
  });
}

export function loadROM(source) {
  return executeROMLoad(null, () => nes.rom.load(source));
}

function executeROMLoad(romId, loader) {
  return (dispatch, getState) => {
    dispatch(clearROMLoadError());
    dispatch(stopEmulator());
    return saveNVRAM().then(() => {
      nes.rom.unload();
      nes.video.clear();
      dispatch(createAction(START_ROM_LOAD, romId));
      return dispatch(createAction(FINISH_ROM_LOAD, loader(getState)));
    }).then(() => {
      return loadNVRAM();
    }).then(() => {
      if (nes.video.output) {
        dispatch(startEmulator());
      } else {
        dispatch(createAction(SET_EMULATOR_SUSPENDED, true)); // User switched to a different view
      }
    });
  };
}

function fetchROM(romId, getState) {
  return new Promise((resolve, reject) => {
    const {items} = selectLibrary(getState());
    const rom = items.find(({id}) => id === romId);
    if (rom) {
      resolve(rom); // In case roms were already fetched in store
    } else {
      romsApi.getOne(romId).then(resolve, reject);
    }
  });
}

export function clearROMLoadError() {
  return createAction(CLEAR_ROM_LOAD_ERROR);
}

export function toggleFullscreen() {
  return () => {
    if (nes.fullscreen.is) {
      return nes.fullscreen.exit();
    }
    return nes.fullscreen.enter();
  };
}
