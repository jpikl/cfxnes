import React from 'react';
import PropTypes from 'prop-types';
import {Port, Device} from '../../../enums';
import './DeviceInput.css';

const DeviceInput = ({input}) => {
  const name = Device.getInputLabel(input);
  return <dt className="device-input">{name}</dt>;
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
