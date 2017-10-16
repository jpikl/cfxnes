import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import promise from '@benmosher/redux-promise';
import {identity} from './common';
import rootReducer, {selectSettingsValues} from './reducers';
import {initSettings} from './actions';
import {saveSettings} from './settings';

const middleware = [thunk, promise];
const applyDevTools = (__DEVELOPMENT__
  && __REDUX_DEVTOOLS_ENABLED__
  && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || identity; // eslint-disable-line no-underscore-dangle

if (__DEVELOPMENT__ && __REDUX_LOGGER_ENABLED__) {
  const {createLogger} = require('redux-logger');
  middleware.push(createLogger({diff: false, duration: true}));
}

const enhancer = applyDevTools(applyMiddleware(...middleware));
const store = createStore(rootReducer, enhancer);

if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
}

store.dispatch(initSettings()).then(() => {
  store.subscribe(() => saveSettings(selectSettingsValues(store.getState())));
});

export default store;
