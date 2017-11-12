import React from 'react';
import PropTypes from 'prop-types';
import {MIN_VIDEO_SCALE, MAX_VIDEO_SCALE, isMsExplorer, isMsEdge} from '../../../common';
import {KeyCode} from '../../../keyboard';
import {ButtonGroup} from '../../common';
import {ToolButton} from '../../toolbar';

const VideoTools = ({scale, onScaleDecrease, onScaleIncrease, onFullscreenToggle}) => (
  <ButtonGroup className="video-tools">
    <ToolButton icon="search-minus" label="Increase scale" labelId="increase-scale-label"
                keyCode={KeyCode.MINUS} disabled={scale <= MIN_VIDEO_SCALE} onClick={onScaleDecrease}/>
    <ToolButton icon="search-plus" label="Decrease scale" labelId="decrease-scale-label"
                keyCode={KeyCode.PLUS} disabled={scale >= MAX_VIDEO_SCALE} onClick={onScaleIncrease}/>
    <ToolButton icon="arrows-alt" label="Fullscreen" labelId="fullscreen-label"
                keyCode={isMsExplorer() || isMsEdge() ? null : KeyCode.M} // Switching fullscreen using keydown event is bugged in IE, Edge
                onClick={onFullscreenToggle}/>
  </ButtonGroup>
);

VideoTools.propTypes = {
  scale: PropTypes.number.isRequired,
  onScaleIncrease: PropTypes.func.isRequired,
  onScaleDecrease: PropTypes.func.isRequired,
  onFullscreenToggle: PropTypes.func.isRequired,
};

export default VideoTools;
