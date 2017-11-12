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

  renderReadOnly() {
    const {port, device} = this.props;
    return (
      <dl className="controls-device">
        <dt className="controls-device-port">Port {port}</dt>
        <dd className="controls-device-device">{Device.getLabel(device)}</dd>
      </dl>
    );
  }

  renderModifiable() {
    const {port, device} = this.props;
    const labelId = 'controls-device-label-' + port;
    return (
      <div className="controls-device">
        <label className="controls-device-label" id={labelId}>
          Port {port}
        </label>
        <ButtonSelect className="controls-device-select" aria-labelledby={labelId}
                      options={Device.options} value={device}
                      onChange={this.handleChange}/>
      </div>
    );
  }

  render() {
    const {onChange} = this.props;
    return onChange ? this.renderModifiable() : this.renderReadOnly();
  }

}
