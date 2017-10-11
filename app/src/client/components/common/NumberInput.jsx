import React from 'react';
import Input, {NUMBER} from './Input';
import './NumberInput.css';

export default ({...attrs}) => (
  <Input type={NUMBER} {...attrs}/>
);
