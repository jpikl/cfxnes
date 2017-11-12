import React from 'react';
import PropTypes from 'prop-types';
import {Port, Device} from '../../../enums';
import ControlsDevice from './ControlsDevice';
import ControlsInputs from './ControlsInputs';
import './Controls.css';

const Controls = ({port, controls, onDeviceChange, onInputAdd, onInputRemove}) => {
  const {device, inputs} = controls;
  return (
    <li className="controls">
      <ControlsDevice port={port} device={device} onChange={onDeviceChange}/>
      <ControlsInputs port={port} device={device} inputs={inputs}
                      onAdd={onInputAdd} onRemove={onInputRemove}/>
    </li>
  );
};

Controls.propTypes = {
  port: PropTypes.oneOf(Port.values).isRequired,
  controls: PropTypes.shape({
    device: PropTypes.oneOf(Device.values).isRequired,
    inputs: PropTypes.object.isRequired,
  }).isRequired,
  onDeviceChange: PropTypes.func,
  onInputAdd: PropTypes.func,
  onInputRemove: PropTypes.func,
};

Controls.defaultProps = {
  onDeviceChange: null,
  onInputAdd: null,
  onInputRemove: null,
};

export default Controls;
