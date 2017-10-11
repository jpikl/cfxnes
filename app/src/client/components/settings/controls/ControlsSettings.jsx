import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Field, Info, LinkButton, Modal, Switch} from '../../common';
import SettingsPanel from '../SettingsPanel';
import ControlsList, {controlsPropType} from './ControlsList';
import GamepadList from './GamepadList';
import connect from './connect';
import './ControlsSettings.css';

export const CONTROLS = 'controls';

const CONTROLS_VISIBLE = 'controls-visible';

class ControlsSettings extends PureComponent {

  static propTypes = {
    active: PropTypes.bool.isRequired,
    controls: controlsPropType.isRequired,
    controlsVisible: PropTypes.bool.isRequired,
    onActivate: PropTypes.func.isRequired,
    onControlsVisibleChange: PropTypes.func.isRequired,
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
      active, controls, controlsVisible, onActivate,
      onControlsVisibleChange, onControlsDeviceChange,
      onControlsInputRemove, onControlsGamepadMap, onControlsReset,
    } = this.props;

    return (
      <SettingsPanel id={CONTROLS} title="Controls" icon="gamepad" active={active} onActivate={onActivate}>
        <ControlsList controls={controls}
                      onDeviceChange={onControlsDeviceChange}
                      onInputAdd={this.handleInputAdd}
                      onInputRemove={onControlsInputRemove}/>
        <Info className="controls-restore-defaults" icon="keyboard-o">
          <LinkButton onClick={onControlsReset}>Restore default keyboard & mouse controls</LinkButton>
        </Info>
        <GamepadList onMap={onControlsGamepadMap}/>
        <Field className="controls-visible-field" inline>
          <Switch inputId={CONTROLS_VISIBLE} value={controlsVisible} onChange={onControlsVisibleChange}/>
          <Field.Label htmlFor={CONTROLS_VISIBLE}>Show controls on emulator page</Field.Label>
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
