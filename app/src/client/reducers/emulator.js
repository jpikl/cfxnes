import {
  START_ROM_LOAD,
  FINISH_ROM_LOAD,
  CLEAR_ROM_LOAD_ERROR,
  SET_EMULATOR_RUNNING,
  SET_EMULATOR_SUSPENDED,
} from '../actionTypes';

import {ActionState} from '../enums';
import {createReducer} from './common';

const initialState = {
  romId: null,
  loadState: ActionState.NONE,
  loadError: '',
  running: false,
  suspended: false,
};

const actionHandlers = {
  [START_ROM_LOAD]: (state, romId) => ({...state, romId, loadState: ActionState.STARTED}),
  [FINISH_ROM_LOAD]: {
    success: state => ({...state, loadState: ActionState.SUCCESS}),
    failure: (state, {message}) => ({...state, loadError: message, loadState: ActionState.FAILURE}),
  },
  [CLEAR_ROM_LOAD_ERROR]: state => ({...state, loadError: ''}),
  [SET_EMULATOR_RUNNING]: (state, running) => ({...state, running}),
  [SET_EMULATOR_SUSPENDED]: (state, suspended) => ({...state, suspended}),
};

export default createReducer(actionHandlers, initialState);
