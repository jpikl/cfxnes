import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {logoSvg} from '../../images';
import './Logo.css';

const Logo = ({className}) => (
  <img className={classNames('logo', className)} src={logoSvg} alt="cfxnes logo"/>
);

Logo.propTypes = {
  className: PropTypes.string,
};

Logo.defaultProps = {
  className: null,
};

export default Logo;
