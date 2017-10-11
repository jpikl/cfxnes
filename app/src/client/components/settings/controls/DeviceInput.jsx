import React from 'react';
import PropTypes from 'prop-types';
import {Port, Device} from '../../../enums';
import './DeviceInput.css';

const DeviceInput = ({input}) => {
  const name = Device.getInputLabel(input);
  return <div className="device-input">{name}</div>;
};

export const deviceInputPropType = PropTypes.shape({
  port: PropTypes.oneOf(Port.values).isRequired,
  device: PropTypes.oneOf(Device.values).isRequired,
  name: PropTypes.string.isRequired,
});

DeviceInput.propTypes = {
  input: deviceInputPropType.isRequired,
};

export default DeviceInput;
