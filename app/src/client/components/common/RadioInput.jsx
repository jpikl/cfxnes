import React from 'react';
import Input, {RADIO} from './Input';

export default ({...attrs}) => (
  <Input type={RADIO} {...attrs}/>
);
