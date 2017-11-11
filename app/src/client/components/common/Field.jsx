import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Field.css';

const Field = ({className, label, labelFor, children, ...attrs}) => (
  <div className={classNames('field', className)} {...attrs}>
    {label && (
      <label className={classNames('field-label', className && `${className}-label`)} htmlFor={labelFor}>
        {label}
      </label>
    )}
    {children}
  </div>
);

Field.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  labelFor: PropTypes.string,
  children: PropTypes.node,
};

Field.defaultProps = {
  className: null,
  label: null,
  labelFor: null,
  children: null,
};

export default Field;
