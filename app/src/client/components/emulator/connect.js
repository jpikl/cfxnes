import {connect} from 'react-redux';
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
  return {romId, routeRomId, loadState, controls, controlsVisible, error};
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
