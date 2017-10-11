import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Input, {RANGE} from './Input';
import './RangeInput.css';

const RangeInput = ({className, filled, ...attrs}) => (
  <Input type={RANGE} className={classNames(className, {filled})} {...attrs}/>
);

RangeInput.propTypes = {
  className: PropTypes.string,
  filled: PropTypes.bool,
};

RangeInput.defaultProps = {
  className: null,
  filled: false,
};

export default RangeInput;
