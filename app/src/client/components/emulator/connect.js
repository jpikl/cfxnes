import {connect} from 'react-redux';
import {Port, Device} from '../../enums';
import {ROM_ID, getEmulatorPath} from '../../routes';
import {selectEmulator, selectSettingsValues} from '../../reducers';

import {
  connectEmulator,
  disconnectEmulator,
  loadROM,
  fetchAndLoadROM,
  setControlsVisible,
  clearEmulatorError,
} from '../../actions';

const mapStateToProps = (state, props) => {
  const routeRomId = props.match.params[ROM_ID] || null;
  const {romId, loadState, error} = selectEmulator(state);
  const {controls, controlsVisible} = selectSettingsValues(state);

  let crosshairVisible = false;
  if (Port.values.some(port => controls[port].device === Device.ZAPPER)) {
    ({crosshairVisible} = selectSettingsValues(state));
  }

  return {romId, routeRomId, loadState, controls, controlsVisible, crosshairVisible, error};
};

const mapDispatchToProps = (dispatch, props) => ({
  onConnect: canvas => dispatch(connectEmulator(canvas)),
  onDisconnect: () => dispatch(disconnectEmulator()),
  onLoad: file => dispatch(loadROM(file)),
  onFetchAndLoad: romId => dispatch(fetchAndLoadROM(romId)),
  onRouteRedirect: romId => props.history.replace(getEmulatorPath(romId)),
  onControlsClose: () => dispatch(setControlsVisible(false)),
  onErrorClose: () => dispatch(clearEmulatorError()),
});

export default connect(mapStateToProps, mapDispatchToProps);
