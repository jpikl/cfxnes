import {defaultSettings} from '../settings';

import {
  SET_ACTIVE_SETTINGS_PANEL,
  SET_SETTINGS_VALUES,
  LOCK_SETTINGS_RESET,
  UNLOCK_SETTINGS_RESET,
} from '../actionTypes';

import {createReducer} from './utils';
import valuesReducer from './settingsValues';

const initialState = {
  activePanelId: 'system',
  resetLocked: false,
  values: defaultSettings,
};

const actionHandlers = {
  [SET_ACTIVE_SETTINGS_PANEL]: (state, activePanelId) => ({...state, activePanelId}),
  [SET_SETTINGS_VALUES]: (state, values) => ({...state, values}),
  [LOCK_SETTINGS_RESET]: state => ({...state, resetLocked: true}),
  [UNLOCK_SETTINGS_RESET]: state => ({...state, resetLocked: false}),
};

export const selectValues = state => state.values;

function fallbackHandler(state = initialState, action) {
  const values = valuesReducer(selectValues(state), action);
  if (values !== selectValues(state)) {
    return {...state, values};
  }
  return state;
}

export default createReducer(actionHandlers, fallbackHandler);
