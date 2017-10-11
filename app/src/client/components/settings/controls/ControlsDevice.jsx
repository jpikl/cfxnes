import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {ButtonSelect} from '../../common';
import {Port, Device} from '../../../enums';
import './ControlsDevice.css';

export default class ControlsDevice extends PureComponent {

  static propTypes = {
    port: PropTypes.oneOf(Port.values).isRequired,
    device: PropTypes.oneOf(Device.values).isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: null,
  }

  handleChange = device => {
    const {port, onChange} = this.props;
    onChange(port, device);
  }

  renderDeviceSelect() {
    const {device} = this.props;
    return <ButtonSelect className="controls-device-select"
                         options={Device.options} value={device}
                         onChange={this.handleChange}/>;
  }

  renderDeviceName() {
    const {device} = this.props;
    return <span> : {Device.getLabel(device)}</span>;
  }

  render() {
    const {port, onChange} = this.props;
    return (
      <div className="controls-device">
        <label className="controls-device-label">Port {port}</label>
        {onChange ? this.renderDeviceSelect() : this.renderDeviceName()}
      </div>
    );
  }

}
