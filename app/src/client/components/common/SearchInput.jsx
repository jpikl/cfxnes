import React from 'react';
import Input, {SEARCH} from './Input';
import './SearchInput.css';

export default ({...attrs}) => (
  <Input type={SEARCH} {...attrs}/>
);
