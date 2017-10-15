import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import {Message} from '../common';
import {getSettingsPath} from '../../routes';
import {ControlsList, controlsPropType, CONTROLS} from '../settings/controls';
import './EmulatorControls.css';

export {controlsPropType};

const EmulatorControls = ({controls, onClose}) => {
  return (
    <Message className="emulator-controls" onClose={onClose}>
      <h3 className="emulator-controls-title">
        <NavLink to={getSettingsPath(CONTROLS)}>Controls</NavLink>
      </h3>
      <ControlsList controls={controls}/>
    </Message>
  );
};

EmulatorControls.propTypes = {
  controls: controlsPropType.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EmulatorControls;
