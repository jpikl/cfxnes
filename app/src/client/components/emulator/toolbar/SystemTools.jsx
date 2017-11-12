import React from 'react';
import PropTypes from 'prop-types';
import {KeyCode} from '../../../keyboard';
import {ButtonGroup} from '../../common';
import {ToolButton} from '../../toolbar';
import './SystemTools.css';

const SystemTools = ({running, onPower, onReset, onStart, onStop}) => (
  <ButtonGroup className="system-tools">
    <ToolButton icon="power-off" label="Power" labelId="power-label"
                keyCode={KeyCode.Q} onClick={onPower}/>
    <ToolButton icon="repeat" label="Reset" labelId="reset-label"
                keyCode={KeyCode.W} onClick={onReset}/>
    <ToolButton className="run-toggle" keyCode={KeyCode.P}
                labelId="pause-play-label"
                label={running ? 'Pause' : 'Play'}
                icon={running ? 'pause' : 'play'}
                onClick={running ? onStop : onStart}/>
  </ButtonGroup>
);

SystemTools.propTypes = {
  running: PropTypes.bool.isRequired,
  onPower: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
};

export default SystemTools;
