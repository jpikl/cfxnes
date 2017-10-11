import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MIN_VIDEO_SCALE, MAX_VIDEO_SCALE} from '../../../common';
import {VideoRenderer, VideoPalette, VideoFilter, FullscreenType} from '../../../enums';
import {ComboBox, Field, NumberSelect, Switch} from '../../common';
import SettingsPanel from '../SettingsPanel';
import connect from './connect';
import './VideoSettings.css';

export const VIDEO = 'video';

const VIDEO_SCALE = 'video-scale';
const VIDEO_PALETTE = 'video-palette';
const VIDEO_FILTER = 'video-filter';
const VIDEO_DEBUG = 'video-debug';
const VIDEO_RENDERER = 'video-renderer';
const FULLSCREEN_TYPE = 'fullscreen-type';
const FPS_VISIBLE = 'fps-visible';

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

  handleVideoRendererChange = webgl => {
    this.props.onVideoRendererChange(webgl ? VideoRenderer.WEBGL : VideoRenderer.CANVAS);
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
      onVideoDebugChange, onFullscreenTypeChange, onFpsVisibleChange,
    } = this.props;

    return (
      <SettingsPanel id={VIDEO} title="Video" icon="desktop" active={active} onActivate={onActivate}>
        <div className="video-fields-1">
          <Field>
            <Field.Label htmlFor={VIDEO_SCALE}>Output scale</Field.Label>
            <NumberSelect id={VIDEO_SCALE} min={MIN_VIDEO_SCALE} max={MAX_VIDEO_SCALE}
                          disabled={MIN_VIDEO_SCALE === MAX_VIDEO_SCALE}
                          value={videoScale} onChange={this.handleVideoScaleChange}/>
          </Field>
          <Field>
            <Field.Label htmlFor={VIDEO_PALETTE}>Color palette</Field.Label>
            <ComboBox selectId={VIDEO_PALETTE} options={VideoPalette.options} value={videoPalette} onChange={onVideoPaletteChange}/>
          </Field>
          <Field>
            <Field.Label htmlFor={FULLSCREEN_TYPE}>Fullscreen mode</Field.Label>
            <ComboBox selectId={FULLSCREEN_TYPE} options={FullscreenType.options} value={fullscreenType} onChange={onFullscreenTypeChange}/>
          </Field>
        </div>
        <div className="video-fields-2">
          <Field>
            <Field.Label htmlFor={VIDEO_FILTER}>Filter</Field.Label>
            <ComboBox selectId={VIDEO_FILTER} options={VideoFilter.options} value={videoFilter} onChange={onVideoFilterChange}/>
          </Field>
          <Field className="video-debug-field" inline>
            <Switch inputId={VIDEO_DEBUG} value={videoDebug} onChange={onVideoDebugChange}/>
            <Field.Label htmlFor={VIDEO_DEBUG}>Enable debug output</Field.Label>
          </Field>
          <Field inline>
            <Switch inputId={VIDEO_RENDERER} value={videoRenderer === VideoRenderer.WEBGL} onChange={this.handleVideoRendererChange}/>
            <Field.Label htmlFor={VIDEO_RENDERER}>Use WebGL for rendering</Field.Label>
          </Field>
          <Field inline>
            <Switch inputId={FPS_VISIBLE} value={fpsVisible} onChange={onFpsVisibleChange}/>
            <Field.Label htmlFor={FPS_VISIBLE}>Show FPS</Field.Label>
          </Field>
        </div>
      </SettingsPanel>
    );
  }

}

export default connect(VideoSettings);
