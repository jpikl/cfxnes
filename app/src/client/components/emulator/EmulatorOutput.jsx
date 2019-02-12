import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Loader, Icon} from '../common';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../common';
import {cartridgeInsertSvg} from '../../images';
import './EmulatorOutput.css';

const EmulatorOutput = ({scale, loading, stopped, crosshair, cartridge, refCanvas, onStart}) => (
  <div className={classNames('emulator-output', {stopped, crosshair})}
       style={{width: scale * VIDEO_WIDTH, height: scale * VIDEO_HEIGHT}}
       onClick={stopped ? onStart : undefined}
       title={stopped && !loading ? 'Click to play' : undefined}>
    <canvas className="emulator-canvas" ref={refCanvas}/>
    <div className={classNames('emulator-dim', {visible: loading || stopped})}/>
    <Icon className={classNames('emulator-play', {visible: stopped && !loading})}
          name="play" size="4x"/>
    <Loader className={classNames('emulator-loader', {visible: loading})} inverse>
      Loading...
    </Loader>
    <img className={classNames('emulator-cartridge', {visible: cartridge})}
        src={cartridgeInsertSvg} aria-hidden="true"
        alt="Drag &amp; drop indication"/>
  </div>
);

EmulatorOutput.propTypes = {
  scale: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  stopped: PropTypes.bool.isRequired,
  crosshair: PropTypes.bool.isRequired,
  cartridge: PropTypes.bool.isRequired,
  refCanvas: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
};

export default EmulatorOutput;
