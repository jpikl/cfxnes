import React from 'react';
import Input, {TEXT} from './Input';
import './TextInput.css';

export default ({...attrs}) => (
  <Input type={TEXT} {...attrs}/>
);
