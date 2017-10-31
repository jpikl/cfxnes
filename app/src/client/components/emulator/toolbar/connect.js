import {connect} from 'react-redux';
import {AudioChannel} from '../../../enums';
import {selectEmulator, selectSettingsValues} from '../../../reducers';

import {
  loadROM,
  resetEmulator,
  powerEmulator,
  startEmulator,
  stopEmulator,
  increaseVideoScale,
  decreaseVideoScale,
  toggleFullscreen,
  setAudioVolume,
  setAudioEnabled,
} from '../../../actions';

const mapStateToProps = state => {
  const {running} = selectEmulator(state);
  const settings = selectSettingsValues(state);
  const {videoScale, fpsVisible, audioEnabled} = settings;
  const audioVolume = settings.audioVolume.master || 0; // undefined when audio is disabled
  return {running, videoScale, fpsVisible, audioEnabled, audioVolume};
};

const mapDispatchToProps = dispatch => ({
  onFileOpen: file => dispatch(loadROM(file)),
  onPower: () => dispatch(powerEmulator()),
  onReset: () => dispatch(resetEmulator()),
  onStart: () => dispatch(startEmulator()),
  onStop: () => dispatch(stopEmulator()),
  onVideoScaleDecrease: () => dispatch(decreaseVideoScale()),
  onVideoScaleIncrease: () => dispatch(increaseVideoScale()),
  onFullscreenToggle: () => dispatch(toggleFullscreen()),
  onAudioEnabledChange: enabled => dispatch(setAudioEnabled(enabled)),
  onAudioVolumeChange: volume => dispatch(setAudioVolume(AudioChannel.MASTER, volume)),
});

export default connect(mapStateToProps, mapDispatchToProps);
