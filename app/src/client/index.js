/* eslint-env node */
/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {autoSaveNVRAM} from './nvram';
import Root from './Root';
import './index.css';

function renderRoot() {
  const reactElement = <AppContainer><Root/></AppContainer>;
  const domElement = document.getElementById('root');
  render(reactElement, domElement);
}

renderRoot();
autoSaveNVRAM();

if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./Root', renderRoot);
}
