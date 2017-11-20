import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Field, Info, LinkButton, Modal, Switch} from '../../common';
import SettingsPanel from '../SettingsPanel';
import ControlsList, {controlsPropType} from './ControlsList';
import GamepadList from './GamepadList';
import connect from './connect';
import './ControlsSettings.css';

export const CONTROLS = 'controls';

class ControlsSettings extends PureComponent {

  static propTypes = {
    active: PropTypes.bool.isRequired,
    controls: controlsPropType.isRequired,
    controlsVisible: PropTypes.bool.isRequired,
    crosshairVisible: PropTypes.bool.isRequired,
    onActivate: PropTypes.func.isRequired,
    onControlsVisibleChange: PropTypes.func.isRequired,
    onCrosshairVisibleChange: PropTypes.func.isRequired,
    onControlsDeviceChange: PropTypes.func.isRequired,
    onControlsInputAdd: PropTypes.func.isRequired,
    onControlsInputRemove: PropTypes.func.isRequired,
    onControlsGamepadMap: PropTypes.func.isRequired,
    onControlsReset: PropTypes.func.isRequired,
  };

  state = {
    inputRequestVisible: false,
  };

  handleInputAdd = deviceInput => {
    this.setState({inputRequestVisible: true});
    this.props.onControlsInputAdd(deviceInput).then(() => {
      this.setState({inputRequestVisible: false});
    });
  };

  render() {
    const {inputRequestVisible} = this.state;
    const {
      active, controls, controlsVisible, crosshairVisible, onActivate,
      onControlsVisibleChange, onCrosshairVisibleChange, onControlsDeviceChange,
      onControlsInputRemove, onControlsGamepadMap, onControlsReset,
    } = this.props;

    return (
      <SettingsPanel id={CONTROLS} title="Controls" icon="gamepad" active={active} onActivate={onActivate}>
        <ControlsList controls={controls}
                      onDeviceChange={onControlsDeviceChange}
                      onInputAdd={this.handleInputAdd}
                      onInputRemove={onControlsInputRemove}/>
        <Info className="separated-controls-field" icon="keyboard-o">
          <LinkButton onClick={onControlsReset}>Restore default keyboard & mouse controls</LinkButton>
        </Info>
        <GamepadList onMap={onControlsGamepadMap}/>
        <Field className="separated-controls-field">
          <Switch label="Use crosshair cursor when Zapper is connected"
                  value={crosshairVisible} onChange={onCrosshairVisibleChange}/>
        </Field>
        <Field>
          <Switch label="Show controls on emulator page"
                  value={controlsVisible} onChange={onControlsVisibleChange}/>
        </Field>
        {inputRequestVisible && (
          <Modal>
            <Modal.Body>Press key or button (ESC to cancel)</Modal.Body>
          </Modal>
        )}
      </SettingsPanel>
    );
  }

}

export default connect(ControlsSettings);
