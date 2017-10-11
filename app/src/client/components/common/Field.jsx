import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Field.css';

const Field = ({className, inline, children, ...attrs}) => (
  <div className={classNames('field', className, {inline})} {...attrs}>
    {children}
  </div>
);

Field.propTypes = {
  className: PropTypes.string,
  inline: PropTypes.bool,
  children: PropTypes.node,
};

Field.defaultProps = {
  className: null,
  inline: false,
  children: null,
};

Field.Label = ({className, children, ...attrs}) => (
  <label className={classNames('field-label', className)} {...attrs}>{children}</label>
);

Field.Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Field.Label.defaultProps = {
  className: null,
  children: null,
};

export default Field;
