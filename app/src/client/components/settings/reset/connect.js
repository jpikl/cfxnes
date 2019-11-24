import {connect} from 'react-redux';
import {resetSettings, deleteNVRams} from '../../../actions';
import {selectDatabase, selectSettings} from '../../../reducers';

const mapStateToProps = state => {
  const {nvramsDeletionState} = selectDatabase(state);
  const {resetLocked} = selectSettings(state);
  return {nvramsDeletionState, settingsResetLocked: resetLocked};
};

const mapDispatchToProps = dispatch => ({
  onSettingsReset: () => dispatch(resetSettings()),
  onNVRamsDelete: () => dispatch(deleteNVRams()),
});

export default connect(mapStateToProps, mapDispatchToProps);
