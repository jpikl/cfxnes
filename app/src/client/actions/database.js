import {log} from '../../common';
import {nvramStore} from '../database';

import {
  UNLOCK_NVRAMS_DELETION,
  START_NVRAMS_DELETION,
  FINISH_NVRAMS_DELETION,
} from '../actionTypes';

import {createAction, UNLOCK_TIMEOUT} from './utils';

export function deleteNVRAMs() {
  return dispatch => {
    dispatch(createAction(START_NVRAMS_DELETION));
    dispatch(createAction(FINISH_NVRAMS_DELETION, nvramStore.clear()))
      .catch(error => log.error('Failed to delete all NVRAMs', error))
      .then(() => {
        setTimeout(() => dispatch(createAction(UNLOCK_NVRAMS_DELETION)), UNLOCK_TIMEOUT);
      });
  };
}
