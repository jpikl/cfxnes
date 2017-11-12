import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MIN_VIDEO_SCALE, MAX_VIDEO_SCALE} from '../../../common';
import {VideoRenderer, VideoPalette, VideoFilter, FullscreenType} from '../../../enums';
import {ComboBox, Field, NumberSelect, Switch} from '../../common';
import SettingsPanel from '../SettingsPanel';
import connect from './connect';
import './VideoSettings.css';

export const VIDEO = 'video';

class VideoSettings extends PureComponent {

  static propTypes = {
    active: PropTypes.bool.isRequired,
    videoRenderer: PropTypes.oneOf(VideoRenderer.values).isRequired,
    videoScale: PropTypes.number.isRequired,
    videoPalette: PropTypes.oneOf(VideoPalette.values).isRequired,
    videoFilter: PropTypes.oneOf(VideoFilter.values).isRequired,
    videoDebug: PropTypes.bool.isRequired,
    fullscreenType: PropTypes.oneOf(FullscreenType.values).isRequired,
    fpsVisible: PropTypes.bool.isRequired,
    onActivate: PropTypes.func.isRequired,
    onVideoRendererChange: PropTypes.func.isRequired,
    onVideoScaleChange: PropTypes.func.isRequired,
    onVideoPaletteChange: PropTypes.func.isRequired,
    onVideoFilterChange: PropTypes.func.isRequired,
    onVideoDebugChange: PropTypes.func.isRequired,
    onFullscreenTypeChange: PropTypes.func.isRequired,
    onFpsVisibleChange: PropTypes.func.isRequired,
  };

  handleVideoScaleChange = scale => {
    if (scale && scale >= MIN_VIDEO_SCALE && scale <= MAX_VIDEO_SCALE) {
      this.props.onVideoScaleChange(scale);
    }
  };

  render() {
    const {
      active, videoRenderer, videoScale, videoPalette, videoFilter, videoDebug,
      fullscreenType, fpsVisible, onActivate, onVideoPaletteChange, onVideoFilterChange,
      onVideoRendererChange, onVideoDebugChange, onFullscreenTypeChange, onFpsVisibleChange,
    } = this.props;

    return (
      <SettingsPanel id={VIDEO} title="Video" icon="desktop" active={active} onActivate={onActivate}>
        <div className="video-fields-1">
          <Field label="Output scale" labelFor="video-scale">
            <NumberSelect inputId="video-scale" min={MIN_VIDEO_SCALE} max={MAX_VIDEO_SCALE}
                          disabled={MIN_VIDEO_SCALE === MAX_VIDEO_SCALE}
                          value={videoScale} onChange={this.handleVideoScaleChange}/>
          </Field>
          <Field label="Color palette" labelFor="video-palette">
            <ComboBox selectId="video-palette" options={VideoPalette.options}
                      value={videoPalette} onChange={onVideoPaletteChange}/>
          </Field>
          <Field label="Fullscreen mode" labelFor="fullscreen-type">
            <ComboBox selectId="fullscreen-type" options={FullscreenType.options}
                      value={fullscreenType} onChange={onFullscreenTypeChange}/>
          </Field>
        </div>
        <div className="video-fields-2">
          <Field label="Renderer" labelFor="video-renderer">
            <ComboBox selectId="video-renderer" options={VideoRenderer.options}
                      value={videoRenderer} onChange={onVideoRendererChange}/>
          </Field>
          <Field label="Filter" labelFor="video-filter">
            <ComboBox selectId="video-filter" options={VideoFilter.options}
                      value={videoFilter} onChange={onVideoFilterChange}/>
          </Field>
          <Field className="video-debug-field">
            <Switch label="Enable debug output" value={videoDebug} onChange={onVideoDebugChange}/>
          </Field>
          <Field>
            <Switch label="Show FPS" value={fpsVisible} onChange={onFpsVisibleChange}/>
          </Field>
        </div>
      </SettingsPanel>
    );
  }

}

export default connect(VideoSettings);
