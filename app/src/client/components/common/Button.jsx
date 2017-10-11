import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Button.css';

const getClassName = (className, active, primary, borderless) => classNames(
  'button',
  (primary && 'primary') || (borderless && 'borderless') || 'default',
  {active},
  className,
);

const Button = ({className, active, primary, borderless, refButton, children, ...attrs}) => (
  <button className={getClassName(className, active, primary, borderless)}
          type="button" ref={refButton} {...attrs}>
    {children}
  </button>
);

Button.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  primary: PropTypes.bool,
  borderless: PropTypes.bool,
  onClick: PropTypes.func,
  refButton: PropTypes.func,
  children: PropTypes.node,
};

Button.defaultProps = {
  className: null,
  active: false,
  primary: false,
  borderless: false,
  onClick: null,
  refButton: null,
  children: null,
};

export default Button;
