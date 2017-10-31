import {
  START_ROM_LOAD,
  FINISH_ROM_LOAD,
  SET_EMULATOR_RUNNING,
  SET_EMULATOR_SUSPENDED,
  SET_EMULATOR_ERROR,
  CLEAR_EMULATOR_ERROR,
} from '../actionTypes';

import {ActionState} from '../enums';
import {createReducer} from './utils';

const initialState = {
  romId: null,
  loadState: ActionState.NONE,
  running: false,
  suspended: false,
  error: '',
};

const actionHandlers = {
  [START_ROM_LOAD]: (state, romId) => ({...state, romId, loadState: ActionState.STARTED}),
  [FINISH_ROM_LOAD]: {
    success: state => ({...state, loadState: ActionState.SUCCESS}),
    failure: (state, {message}) => ({...state, error: message, loadState: ActionState.FAILURE}),
  },
  [SET_EMULATOR_RUNNING]: (state, running) => ({...state, running}),
  [SET_EMULATOR_SUSPENDED]: (state, suspended) => ({...state, suspended}),
  [SET_EMULATOR_ERROR]: (state, {message}) => ({...state, error: message}),
  [CLEAR_EMULATOR_ERROR]: state => ({...state, error: ''}),
};

export default createReducer(actionHandlers, initialState);
