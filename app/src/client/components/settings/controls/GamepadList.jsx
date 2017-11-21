import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Info} from '../../common';
import Gamepad from './Gamepad';
import './GamepadList.css';

const supported = navigator.getGamepads != null;

export default class GamepadList extends PureComponent {

  static propTypes = {
    onMap: PropTypes.func.isRequired,
  };

  state = {
    gamepads: null,
  };

  componentDidMount() {
    if (supported) {
      this.timer = setInterval(this.updateGamepads, 500);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateGamepads = () => {
    const gamepads = navigator.getGamepads();
    this.setState({gamepads: Array.from(gamepads).filter(Boolean)});
  }

  renderLoadingMessage() {
    return (
      <Info tag="li" icon="gamepad">
        Detecting connected gamepads...
      </Info>
    );
  }

  renderUnsupportedMessage() {
    return (
      <Info tag="li" icon="gamepad">
        Your browser does not support gamepads.
      </Info>
    );
  }

  renderEmptyMessage() {
    return (
      <Info tag="li" icon="gamepad">
        No gamepads seem to be connected.
        Plug in a gamepad and then press any of its buttons to activate it.
      </Info>
    );
  }

  renderGamepad = gamepad => {
    const {onMap} = this.props;
    return <Gamepad key={gamepad.index} gamepad={gamepad} onMap={onMap}/>;
  }

  render() {
    const {state: {gamepads}} = this;
    return (
      <ul className="gamepad-list">
        {!supported && this.renderUnsupportedMessage()}
        {supported && !gamepads && this.renderLoadingMessage()}
        {gamepads && !gamepads.length && this.renderEmptyMessage()}
        {gamepads && gamepads.map(this.renderGamepad)}
      </ul>
    );
  }

}
