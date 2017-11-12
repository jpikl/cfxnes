import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Button, Icon, Logo, Tooltip} from '../common';
import {ROOT_PATH} from '../../routes';
import './Brand.css';

const Brand = ({collapsed, onCollapsedChange}) => (
  <div className="brand">
    <Link className="brand-link" to={ROOT_PATH} aria-label="Home page">
      <Logo className="brand-logo"/>
      <h1 className="brand-title">cfxnes</h1>
    </Link>
    <Button className="brand-collapser" active={!collapsed}
            onClick={onCollapsedChange} aria-hidden="true">
      <Icon name="bars"/>
      <Tooltip placement="left">Toggle</Tooltip>
    </Button>
  </div>
);

Brand.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onCollapsedChange: PropTypes.func.isRequired,
};

export default Brand;
