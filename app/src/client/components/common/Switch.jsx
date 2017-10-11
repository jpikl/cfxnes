import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckboxInput from './CheckboxInput';
import './Switch.css';

const Switch = ({className, inputId, disabled, value, onChange, children, ...attrs}) => (
  <label className={classNames('switch', className)} {...attrs}>
    <CheckboxInput className="switch-input" id={inputId}
                   disabled={disabled} unStyled
                   value={value} onChange={onChange}/>
    <span className="switch-slider"/>
    {children}
  </label>
);

Switch.propTypes = {
  className: PropTypes.string,
  inputId: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Switch.defaultProps = {
  className: null,
  inputId: null,
  disabled: false,
  value: false,
  onChange: null,
  children: null,
};

export default Switch;
