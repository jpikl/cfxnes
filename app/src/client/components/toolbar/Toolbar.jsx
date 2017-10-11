import React from 'react';
import PropTypes from 'prop-types';
import {Theme} from '../../enums';
import ToolButton from './ToolButton';
import connect from './connect';
import './Toolbar.css';

const Toolbar = ({theme, onThemeSwitch, children}) => (
  <div className="toolbar">
    {children}
    <ToolButton className="toolbar-theme-switch" icon={Theme.getIcon(theme)}
                label={Theme.getLabel(theme)} onClick={onThemeSwitch}/>
  </div>
);

Toolbar.propTypes = {
  theme: PropTypes.oneOf(Theme.values).isRequired,
  onThemeSwitch: PropTypes.func.isRequired,
  children: PropTypes.node,
};

Toolbar.defaultProps = {
  children: null,
};

export default connect(Toolbar);
