import {connect} from 'react-redux';
import {Device} from '../../../enums';
import {selectSettingsValues} from '../../../reducers';

import {
  setControlsDevice,
  addControlsInput,
  removeControlsInput,
  resetControls,
  setControlsVisible,
  bindGamepadToJoypad,
} from '../../../actions';

const mapStateToProps = state => {
  const {controls, controlsVisible} = selectSettingsValues(state);
  return {controls, controlsVisible};
};

const mapDispatchToProps = dispatch => ({
  onControlsVisibleChange: visible => dispatch(setControlsVisible(visible)),
  onControlsDeviceChange: (port, device) => dispatch(setControlsDevice(port, device)),
  onControlsInputAdd: deviceInput => dispatch(addControlsInput(deviceInput)),
  onControlsInputRemove: sourceInput => dispatch(removeControlsInput(sourceInput)),
  onControlsGamepadMap: (index, port) => {
    dispatch(setControlsDevice(port, Device.JOYPAD));
    dispatch(bindGamepadToJoypad(index, port));
  },
  onControlsReset: () => dispatch(resetControls()),
});

export default connect(mapStateToProps, mapDispatchToProps);
