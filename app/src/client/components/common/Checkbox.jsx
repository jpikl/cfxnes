import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckboxInput from './CheckboxInput';
import './Checkbox.css';

const Checkbox = ({className, inputId, disabled, value, onChange, children, ...attrs}) => (
  <label className={classNames('checkbox', className)} {...attrs}>
    <CheckboxInput className="checkbox-input" id={inputId}
                   disabled={disabled} unStyled
                   value={value} onChange={onChange}/>
    <span className="checkbox-box"/>
    {children}
  </label>
);

Checkbox.propTypes = {
  className: PropTypes.string,
  inputId: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Checkbox.defaultProps = {
  className: null,
  inputId: null,
  disabled: false,
  value: false,
  onChange: null,
  children: null,
};

export default Checkbox;
