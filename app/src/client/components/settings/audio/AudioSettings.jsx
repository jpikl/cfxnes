import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Field, Icon, Message, Switch, keysValuePropType} from '../../common';
import {AudioChannel} from '../../../enums';
import SettingsPanel from '../SettingsPanel';
import AudioVolumeField from './AudioVolumeField';
import connect from './connect';
import './AudioSettings.css';

export const AUDIO = 'audio';

class AudioSettings extends PureComponent {

  static propTypes = {
    active: PropTypes.bool.isRequired,
    audioSupported: PropTypes.bool.isRequired,
    audioEnabled: PropTypes.bool.isRequired,
    audioVolume: keysValuePropType(AudioChannel.values, PropTypes.number).isRequired,
    onActivate: PropTypes.func.isRequired,
    onAudioEnabledChange: PropTypes.func.isRequired,
    onAudioVolumeChange: PropTypes.func.isRequired,
  };

  renderNotSupportedMessage() {
    return (
      <Message>
        <Icon name="exclamation-triangle"/> Your browser does not support Web Audio.
      </Message>
    );
  }

  renderEnabledField() {
    const {audioEnabled, onAudioEnabledChange} = this.props;
    return (
      <Field className="audio-enabled-field">
        <Switch label="Enable audio" value={audioEnabled} onChange={onAudioEnabledChange}/>
      </Field>
    );
  }

  renderVolumeField = channel => {
    const {audioEnabled, audioVolume, onAudioVolumeChange} = this.props;
    return <AudioVolumeField key={channel} channel={channel} disabled={!audioEnabled}
                             value={audioVolume[channel]} onChange={onAudioVolumeChange}/>;
  }

  render() {
    const {audioSupported, active, onActivate} = this.props;
    return (
      <SettingsPanel id={AUDIO} title="Audio" icon="music" active={active} onActivate={onActivate}>
        {!audioSupported && this.renderNotSupportedMessage()}
        {audioSupported && this.renderEnabledField()}
        {audioSupported && AudioChannel.values.map(this.renderVolumeField)}
      </SettingsPanel>
    );
  }

}

export default connect(AudioSettings);
