import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from '../common';
import {cartridgeInsertSvg} from '../../images';
import './EmulatorOutput.css';

const EmulatorOutput = ({loading, refCanvas}) => (
  <div className="emulator-output">
    <canvas className="emulator-canvas" ref={refCanvas}/>
    <img className="emulator-cartridge" src={cartridgeInsertSvg} aria-hidden="true"/>
    {loading && (
      <Loader className="emulator-loader" inverse>Loading...</Loader>
    )}
  </div>
);

EmulatorOutput.propTypes = {
  loading: PropTypes.bool.isRequired,
  refCanvas: PropTypes.func.isRequired,
};

export default EmulatorOutput;
