/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {log} from '../common';
import {saveNVRAM} from './nvram';
import Root from './Root';
import './index.css';

log.setLevel(__LOG_LEVEL__);

function renderRoot() {
  const reactElement = <AppContainer><Root/></AppContainer>;
  const domElement = document.getElementById('root');
  render(reactElement, domElement);
}

renderRoot();

if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./Root', renderRoot);
}

setInterval(saveNVRAM, 60000);
addEventListener('beforeunload', () => { saveNVRAM(); });
