import {connect} from 'react-redux';
import {setActiveSettingsPanel} from '../../actions';
import {selectSettings} from '../../reducers';
import {ACTIVE_PANEL_ID, getSettingsPath} from '../../routes';

const mapStateToProps = (state, props) => {
  const routePanelId = props.match.params[ACTIVE_PANEL_ID] || null;
  const {activePanelId} = selectSettings(state);
  return {routePanelId, activePanelId};
};

const mapDispatchToProps = (dispatch, props) => ({
  onActivePanelChange: id => dispatch(setActiveSettingsPanel(id)),
  onRoutePanelChange: id => props.history.replace(getSettingsPath(id)),
});

export default connect(mapStateToProps, mapDispatchToProps);
