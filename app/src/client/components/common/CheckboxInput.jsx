import React from 'react';
import Input, {CHECKBOX} from './Input';

export default ({...attrs}) => (
  <Input type={CHECKBOX} {...attrs}/>
);
