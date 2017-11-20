import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Loader} from '../common';
import {cartridgeInsertSvg} from '../../images';
import './EmulatorOutput.css';

const EmulatorOutput = ({loading, crosshair, refCanvas}) => (
  <div className={classNames('emulator-output', {crosshair})}>
    <canvas className="emulator-canvas" ref={refCanvas}/>
    <img className="emulator-cartridge" src={cartridgeInsertSvg}
         alt="Drag &amp; drop indication" aria-hidden="true"/>
    {loading && (
      <Loader className="emulator-loader" inverse>Loading...</Loader>
    )}
  </div>
);

EmulatorOutput.propTypes = {
  loading: PropTypes.bool.isRequired,
  crosshair: PropTypes.bool.isRequired,
  refCanvas: PropTypes.func.isRequired,
};

export default EmulatorOutput;
