import {connect} from 'react-redux';
import {resetSettings, deleteNVRAMs} from '../../../actions';
import {selectDatabase, selectSettings} from '../../../reducers';

const mapStateToProps = state => {
  const {nvramsDeletionState} = selectDatabase(state);
  const {resetLocked} = selectSettings(state);
  return {nvramsDeletionState, settingsResetLocked: resetLocked};
};

const mapDispatchToProps = dispatch => ({
  onSettingsReset: () => dispatch(resetSettings()),
  onNVRAMsDelete: () => dispatch(deleteNVRAMs()),
});

export default connect(mapStateToProps, mapDispatchToProps);
