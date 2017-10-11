import React from 'react';
import PropTypes from 'prop-types';
import {KeyCode} from '../../keyboard';
import {Tooltip} from '../common';
import './ToolTooltip.css';

const ToolTooltip = ({label, keyCode, ...attrs}) => (
  <Tooltip className="tool-tooltip" {...attrs}>
    {label && (
      <span className="tool-tooltip-label">
        {label}
      </span>
    )}
    {keyCode && (
      <span className="tool-tooltip-shortcut">
        Alt+{KeyCode.getName(keyCode)}
      </span>
    )}
  </Tooltip>
);

ToolTooltip.propTypes = {
  label: PropTypes.string,
  keyCode: PropTypes.number,
};

ToolTooltip.defaultProps = {
  label: null,
  keyCode: null,
};

export default ToolTooltip;
