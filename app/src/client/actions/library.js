import {romsApi} from '../api';

import {
  SET_LIBRARY_FILTER,
  START_LIBRARY_FETCH,
  FINISH_LIBRARY_FETCH,
} from '../actionTypes';

import {createAction} from './utils';

export function setLibraryFilter(filter) {
  return createAction(SET_LIBRARY_FILTER, filter);
}

export function fetchLibraryItems() {
  return dispatch => {
    dispatch(createAction(START_LIBRARY_FETCH));
    dispatch(createAction(FINISH_LIBRARY_FETCH, romsApi.getAll()));
  };
}
