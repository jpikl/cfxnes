import React from 'react';
import PropTypes from 'prop-types';
import {Message} from '../common';
import './EmulatorError.css';

const EmulatorError = ({message, onClose}) => (
  <Message className="emulator-error" type="error" onClose={onClose}>
    {message}
  </Message>
);

EmulatorError.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EmulatorError;
