import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Port, Device} from '../../../enums';
import ControlsInputsRow from './ControlsInputsRow';
import './ControlsInputs.css';

export default class ControlsInputs extends PureComponent {

  static propTypes = {
    port: PropTypes.oneOf(Port.values).isRequired,
    device: PropTypes.oneOf(Device.values).isRequired,
    inputs: PropTypes.object.isRequired,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
  };

  static defaultProps = {
    onAdd: null,
    onRemove: null,
  };

  renderInputsRow = name => {
    const {port, device, inputs, onAdd, onRemove} = this.props;
    const deviceInput = {port, device, name};
    const deviceId = Device.getInputId(deviceInput);

    return <ControlsInputsRow key={deviceId}
                              deviceInput={deviceInput}
                              sourceInputs={inputs[device][name]}
                              onAdd={onAdd}
                              onRemove={onRemove}/>;
  }

  render() {
    const {device} = this.props;
    return (
      <div className="controls-inputs">
        {Device.getInputNames(device).map(this.renderInputsRow)}
      </div>
    );
  }

}
