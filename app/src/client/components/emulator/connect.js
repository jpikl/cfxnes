import {connect} from 'react-redux';
import {ROM_ID, getEmulatorPath} from '../../routes';
import {selectEmulator, selectSettingsValues} from '../../reducers';

import {
  connectEmulator,
  disconnectEmulator,
  loadROM,
  fetchAndloadROM,
  clearROMLoadError,
  setControlsVisible,
} from '../../actions';

const mapStateToProps = (state, props) => {
  const routeRomId = props.match.params[ROM_ID] || null;
  const {romId, loadState, loadError} = selectEmulator(state);
  const {controls, controlsVisible} = selectSettingsValues(state);
  return {romId, routeRomId, loadState, loadError, controls, controlsVisible};
};

const mapDispatchToProps = (dispatch, props) => ({
  onConnect: canvas => dispatch(connectEmulator(canvas)),
  onDisconnect: () => dispatch(disconnectEmulator()),
  onLoad: file => dispatch(loadROM(file)),
  onFetchAndLoad: romId => dispatch(fetchAndloadROM(romId)),
  onRouteRedirect: romId => props.history.replace(getEmulatorPath(romId)),
  onErrorClose: () => dispatch(clearROMLoadError()),
  onControlsClose: () => dispatch(setControlsVisible(false)),
});

export default connect(mapStateToProps, mapDispatchToProps);
