import {nes} from '../common';
import {ActionState} from '../enums';
import {romsApi} from '../api';
import {loadNVRAM, saveNVRAM} from '../nvram';

import {
  START_ROM_LOAD,
  FINISH_ROM_LOAD,
  SET_EMULATOR_RUNNING,
  SET_EMULATOR_SUSPENDED,
  SET_EMULATOR_ERROR,
  CLEAR_EMULATOR_ERROR,
} from '../actionTypes';

import {selectEmulator, selectLibrary} from '../reducers';
import {createAction} from './utils';

export function connectEmulator(canvas) {
  return (dispatch, getState) => {
    try {
      nes.video.output = canvas;
      const {suspended} = selectEmulator(getState());
      if (suspended) {
        dispatch(resumeEmulator());
      } else if (nes.rom.loaded) {
        nes.step(); // To refresh canvas
      }
    } catch (error) {
      dispatch(setEmulatorError(error));
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

export function fetchAndLoadROM(romId) {
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
    dispatch(clearEmulatorError());
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
        // We want to start the emulator immediately after loading finishes.
        // This, however, must be done only after an user interaction, because
        // Chrome autoplay policy would disable sound otherwise.
        // There are two cases when we can start the emulator:
        //   1) ROM was loaded from file.
        //   2) ROM was selected from the library page.
        const {fetchState} = selectLibrary(getState());
        if (romId == null || fetchState !== ActionState.NONE) {
          dispatch(startEmulator());
        }
      } else {
        // User switched to a different view while loading was in progress.
        dispatch(createAction(SET_EMULATOR_SUSPENDED, true));
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

function setEmulatorError(error) {
  return createAction(SET_EMULATOR_ERROR, error);
}

export function clearEmulatorError() {
  return createAction(CLEAR_EMULATOR_ERROR);
}

export function toggleFullscreen() {
  return () => {
    if (nes.fullscreen.is) {
      return nes.fullscreen.exit();
    }
    return nes.fullscreen.enter();
  };
}
