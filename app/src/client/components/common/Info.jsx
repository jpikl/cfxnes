import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import './Info.css';

const Info = ({className, icon, children, ...attrs}) => (
  <div className={classNames('info', className)} {...attrs}>
    <Icon className="info-icon" name={icon}/>
    <div className="info-content">
      {children}
    </div>
  </div>
);

Info.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Info.defaultProps = {
  className: null,
  children: null,
};

export default Info;
