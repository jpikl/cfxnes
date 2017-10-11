import {connect} from 'react-redux';
import {selectSettingsValues} from '../../../reducers';

import {
  setVideoRenderer,
  setVideoScale,
  setVideoPalette,
  setVideoFilter,
  setVideoDebug,
  setFullscreenType,
  setFpsVisible,
} from '../../../actions';

const mapStateToProps = state => {
  const {
    videoRenderer, videoScale, videoPalette, videoFilter,
    videoDebug, fullscreenType, fpsVisible,
  } = selectSettingsValues(state);
  return {
    videoRenderer, videoScale, videoPalette, videoFilter,
    videoDebug, fullscreenType, fpsVisible,
  };
};

const mapDispatchToProps = dispatch => ({
  onVideoRendererChange: renderer => dispatch(setVideoRenderer(renderer)),
  onVideoScaleChange: scale => dispatch(setVideoScale(scale)),
  onVideoPaletteChange: palette => dispatch(setVideoPalette(palette)),
  onVideoFilterChange: filter => dispatch(setVideoFilter(filter)),
  onVideoDebugChange: debug => dispatch(setVideoDebug(debug)),
  onFullscreenTypeChange: type => dispatch(setFullscreenType(type)),
  onFpsVisibleChange: visible => dispatch(setFpsVisible(visible)),
});

export default connect(mapStateToProps, mapDispatchToProps);
