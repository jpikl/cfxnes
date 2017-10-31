import {
  SET_LIBRARY_FILTER,
  START_LIBRARY_FETCH,
  FINISH_LIBRARY_FETCH,
} from '../actionTypes';

import {ActionState} from '../enums';
import {createReducer} from './utils';

const initialState = {
  fetchState: ActionState.NONE,
  fetchError: '',
  filter: '',
  items: [],
};

const actionHandlers = {
  [SET_LIBRARY_FILTER]: (state, filter) => ({...state, filter}),
  [START_LIBRARY_FETCH]: state => ({...state, fetchState: ActionState.STARTED}),
  [FINISH_LIBRARY_FETCH]: {
    success: (state, items) => ({...state, items, fetchState: ActionState.SUCCESS}),
    failure: (state, {message}) => ({...state, fetchError: message, fetchState: ActionState.FAILURE}),
  },
};

export default createReducer(actionHandlers, initialState);
