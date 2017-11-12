import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import './Info.css';

const Info = ({tag, className, icon, children, ...attrs}) => {
  const Tag = tag;
  return (
    <Tag className={classNames('info', className)} {...attrs}>
      <Icon className="info-icon" name={icon}/>
      <div className="info-content">
        {children}
      </div>
    </Tag>
  );
};

Info.propTypes = {
  tag: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Info.defaultProps = {
  tag: 'div',
  className: null,
  children: null,
};

export default Info;
