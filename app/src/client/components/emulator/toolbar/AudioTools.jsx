import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {isAncestorOrSelf} from '../../../common';
import {KeyCode, addKeyDownListener, removeKeyDownListener} from '../../../keyboard';
import {Button, ButtonGroup, Checkbox, Icon, PercentageSlider, Popup, Tooltip} from '../../common';
import {ToolTooltip} from '../../toolbar';
import './AudioTools.css';

export default class AudioTools extends PureComponent {

  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    value: PropTypes.number.isRequired,
    onEnabledChange: PropTypes.func.isRequired,
    onValueChange: PropTypes.func.isRequired,
  };

  state = {
    popupVisible: false,
  };

  componentDidMount() {
    addKeyDownListener(this.handleKeyDown);
  }

  componentWillUnmount() {
    removeKeyDownListener(this.handleKeyDown);
  }

  handleKeyDown = event => {
    if (event.altKey && event.keyCode === KeyCode.L) {
      const {enabled, onEnabledChange} = this.props;
      onEnabledChange(!enabled);
      return true;
    }
    return false;
  };

  setButton = button => {
    this.button = button;
  }

  handlePopupToggle = () => {
    this.setState({popupVisible: !this.state.popupVisible});
  };

  handlePopupClose = event => {
    if (!isAncestorOrSelf(event.target, this.button)) {
      this.setState({popupVisible: false});
    }
  };

  getVolumeIconName() {
    const {value} = this.props;
    if (value > 0.5) return 'volume-up';
    if (value > 0) return 'volume-down';
    return 'volume-off';
  }

  renderVolumeButton() {
    const {enabled} = this.props;
    const {popupVisible} = this.state;
    return (
      <Button active={popupVisible} refButton={this.setButton}
              aria-pressed={popupVisible}
              aria-label="Toggle volume popup"
              onClick={this.handlePopupToggle}>
        <Icon name={this.getVolumeIconName()} fixedWidth/>
        {!enabled && <Icon name="ban" size="2x" className="audio-volume-disable-icon"/>}
        {!popupVisible && <Tooltip placement="bottom" aria-hidden="true">Volume</Tooltip>}
      </Button>
    );
  }

  renderVolumePopup() {
    const {enabled, value, onEnabledChange, onValueChange} = this.props;
    return (
      <Popup className="audio-volume-popup" onBlur={this.handlePopupClose}>
        <Checkbox value={enabled} onChange={onEnabledChange} inputLabel="Audio enabled">
          <ToolTooltip placement="right" keyCode={KeyCode.L} aria-hidden="true"
                       label={enabled ? 'Enabled' : 'Muted'}/>
        </Checkbox>
        <PercentageSlider vertical disabled={!enabled} inputLabel="Audio volume"
                          value={value} onChange={onValueChange}/>
      </Popup>
    );
  }

  render() {
    const {popupVisible} = this.state;
    return (
      <ButtonGroup className="audio-tools">
        {this.renderVolumeButton()}
        {popupVisible && this.renderVolumePopup()}
      </ButtonGroup>
    );
  }

}
