import React from 'react';
import PropTypes from 'prop-types';
import {formatMultiplier} from '../../../common';
import {ComboBox, Field, Slider} from '../../common';
import {Region} from '../../../enums';
import SettingsPanel from '../SettingsPanel';
import connect from './connect';
import './SystemSettings.css';

export const SYSTEM = 'system';

function formatSpeed(value) {
  return (value * 100) % 50 === 0 ? formatMultiplier(value) : null;
}

const SystemSettings = ({active, region, speed, onActivate, onRegionChange, onSpeedChange}) => (
  <SettingsPanel id={SYSTEM} title="System" icon="server" active={active} onActivate={onActivate}>
    <Field label="Region" labelFor="region">
      <ComboBox selectId="region" options={Region.options} value={region} onChange={onRegionChange}/>
    </Field>
    <Field label="Emulation speed" labelFor="speed">
      <Slider inputId="speed" min={0.5} max={2} step={0.25} marksFormat={formatSpeed}
              value={speed} onChange={onSpeedChange}/>
    </Field>
  </SettingsPanel>
);

SystemSettings.propTypes = {
  active: PropTypes.bool.isRequired,
  region: PropTypes.oneOf(Region.values).isRequired,
  speed: PropTypes.number.isRequired,
  onActivate: PropTypes.func.isRequired,
  onRegionChange: PropTypes.func.isRequired,
  onSpeedChange: PropTypes.func.isRequired,
};

export default connect(SystemSettings);
