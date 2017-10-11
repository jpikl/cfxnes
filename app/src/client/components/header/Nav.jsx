import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Nav.css';

const Nav = ({className, children, ...attrs}) => (
  <nav className={classNames('nav', className)} {...attrs}>
    {children}
  </nav>
);

Nav.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Nav.defaultProps = {
  className: null,
  children: null,
};

export default Nav;
