import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Field, PercentageSlider} from '../../common';
import {AudioChannel} from '../../../enums';
import './AudioVolumeField.css';

export default class AudioVolumeField extends PureComponent {

  static propTypes = {
    channel: PropTypes.oneOf(AudioChannel.values).isRequired,
    disabled: PropTypes.bool.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = value => {
    const {channel, onChange} = this.props;
    onChange(channel, value);
  };

  render() {
    const {channel, disabled, value} = this.props;
    const inputId = `audio-volume-${channel}`;
    const label = AudioChannel.getLabel(channel);

    return (
      <Field className="audio-volume-field" label={label} labelFor={inputId}>
        <PercentageSlider className="audio-volume-field-input"
                          inputId={inputId} vertical disabled={disabled}
                          value={value} onChange={this.handleChange}/>
      </Field>
    );
  }

}
