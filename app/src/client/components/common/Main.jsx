import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {isMsExplorer} from '../../common';
import './Main.css';

const Main = ({className, wrapContent, refMain, children, ...attrs}) => {
  const type = isMsExplorer() ? 'div' : 'main'; // IE does not know main element
  const props = {className: classNames('main', className), ref: refMain, ...attrs};
  if (type !== 'main') {
    props.role = 'main';
  }
  const content = wrapContent ? <div className="main-content">{children}</div> : children;
  return React.createElement(type, props, content);
};

Main.propTypes = {
  className: PropTypes.string,
  wrapContent: PropTypes.bool,
  refMain: PropTypes.func,
  children: PropTypes.node,
};

Main.defaultProps = {
  className: null,
  wrapContent: PropTypes.false,
  refMain: null,
  children: null,
};

export default Main;
