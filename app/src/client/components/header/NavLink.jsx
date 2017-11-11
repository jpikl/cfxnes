import React from 'react';
import PropTypes from 'prop-types';
import {NavLink as BaseNavLink} from 'react-router-dom';
import {Icon, Tooltip} from '../common';
import './NavLink.css';

const NavLink = ({to, icon, label}) => (
  <BaseNavLink to={to} className="nav-link">
    <Icon className="nav-link-icon" name={icon} size="lg"/>
    <span className="nav-link-label">{label}</span>
    <Tooltip placement="bottom" aria-hidden="true">{label}</Tooltip>
  </BaseNavLink>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default NavLink;
