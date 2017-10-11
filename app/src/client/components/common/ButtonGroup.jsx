import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './ButtonGroup.css';

const ButtonGroup = ({className, children, ...attrs}) => (
  <div className={classNames('button-group', className)} {...attrs}>
    {children}
  </div>
);

ButtonGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

ButtonGroup.defaultProps = {
  className: null,
  children: null,
};

export default ButtonGroup;
