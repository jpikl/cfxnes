import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Icon} from '../common';
import './HomeLink.css';

const HomeLink = ({to, icon, label}) => (
  <Link to={to} className="home-link">
    <Icon className="home-link-icon" name={icon} size="3x"/>
    <div className="home-link-label">{label}</div>
  </Link>
);

HomeLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default HomeLink;
