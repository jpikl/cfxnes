import React from 'react';
import {formatPercentage} from '../../common';
import Slider from './Slider';

export default ({...attrs}) => (
  <Slider filled min={0} max={1} step={0.01} tooltipFormat={formatPercentage} {...attrs}/>
);
