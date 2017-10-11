import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Main.css';

const Main = ({className, wrapContent, refMain, children, ...attrs}) => (
  <main className={classNames('main', className)} ref={refMain} {...attrs}>
    {wrapContent ? <div className="main-content">{children}</div> : children}
  </main>
);

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
