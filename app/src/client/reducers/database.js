import {
  UNLOCK_NVRAMS_DELETION,
  START_NVRAMS_DELETION,
  FINISH_NVRAMS_DELETION,
} from '../actionTypes';

import {ActionState} from '../enums';
import {createReducer} from './utils';

const initialState = {
  nvramsDeletionState: ActionState.NONE,
};

const actionHandlers = {
  [UNLOCK_NVRAMS_DELETION]: state => ({...state, nvramsDeletionState: ActionState.NONE}),
  [START_NVRAMS_DELETION]: state => ({...state, nvramsDeletionState: ActionState.STARTED}),
  [FINISH_NVRAMS_DELETION]: {
    success: state => ({...state, nvramsDeletionState: ActionState.SUCCESS}),
    failure: state => ({...state, nvramsDeletionState: ActionState.FAILURE}),
  },
};

export default createReducer(actionHandlers, initialState);
