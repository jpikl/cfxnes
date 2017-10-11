import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Theme} from '../../enums';
import connect from './connect';
import './App.css';

const App = ({theme, children}) => (
  <div className={classNames('app', theme)}>
    {children}
  </div>
);

App.propTypes = {
  theme: PropTypes.oneOf(Theme.values).isRequired,
  children: PropTypes.node,
};

App.defaultProps = {
  children: null,
};

export default connect(App);
