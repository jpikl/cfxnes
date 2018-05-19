/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import {render} from 'react-dom';
import {hot} from 'react-hot-loader';
import {log} from '../common';
import {saveNVRAM} from './nvram';
import Root from './Root';
import './index.css';

log.setLevel(__LOG_LEVEL__);

const RootWrapper = __DEVELOPMENT__ ? hot(module)(Root) : Root;

render(<RootWrapper/>, document.getElementById('root'));

setInterval(saveNVRAM, 60000);
addEventListener('beforeunload', () => { saveNVRAM(); });
