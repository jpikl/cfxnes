import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import './Loader.css';

const Loader = ({className, inverse, children, ...attrs}) => (
  <div className={classNames('loader', className, {inverse})} {...attrs} aria-hidden="true">
    <Icon className="loader-icon" name="spinner" size="2x" spin pulse/>
    <span className="loader-text">{children}</span>
  </div>
);

Loader.propTypes = {
  className: PropTypes.string,
  inverse: PropTypes.bool,
  children: PropTypes.string,
};

Loader.defaultProps = {
  className: null,
  inverse: false,
  children: null,
};

export default Loader;
