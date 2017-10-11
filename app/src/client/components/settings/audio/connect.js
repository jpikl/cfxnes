import {connect} from 'react-redux';
import {setAudioEnabled, setAudioVolume} from '../../../actions';
import {selectSettingsValues} from '../../../reducers';
import {audioSupported} from '../../../settings';

const mapStateToProps = state => {
  const {audioEnabled, audioVolume} = selectSettingsValues(state);
  return {audioSupported, audioEnabled, audioVolume};
};

const mapDispatchToProps = dispatch => ({
  onAudioEnabledChange: enabled => dispatch(setAudioEnabled(enabled)),
  onAudioVolumeChange: (channel, volume) => dispatch(setAudioVolume(channel, volume)),
});

export default connect(mapStateToProps, mapDispatchToProps);
