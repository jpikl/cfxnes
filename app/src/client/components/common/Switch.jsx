import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckboxInput from './CheckboxInput';
import './Switch.css';

const Switch = ({className, inputId, inputLabel, label, disabled, value, onChange, children, ...attrs}) => (
  <label className={classNames('switch', className)} {...attrs}>
    <CheckboxInput className="switch-input" id={inputId} arial-label={inputLabel}
                   disabled={disabled} unStyled
                   value={value} onChange={onChange}/>
    <span className="switch-slider" aria-hidden="true"/>
    {label && <span className="switch-label">{label}</span>}
    {children}
  </label>
);

Switch.propTypes = {
  className: PropTypes.string,
  inputId: PropTypes.string,
  inputLabel: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Switch.defaultProps = {
  className: null,
  inputId: null,
  inputLabel: null,
  label: null,
  disabled: false,
  value: false,
  onChange: null,
  children: null,
};

export default Switch;
