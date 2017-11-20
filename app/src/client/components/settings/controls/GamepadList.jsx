import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Info} from '../../common';
import Gamepad from './Gamepad';
import './GamepadList.css';

export default class GamepadList extends PureComponent {

  static propTypes = {
    onMap: PropTypes.func.isRequired,
  };

  state = {
    gamepads: [],
  };

  componentDidMount() {
    if (navigator.getGamepads) {
      this.timer = setInterval(this.updateGamepads, 500);
    } else {
      this.timer = -1;
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
        Detecting gamepad support...
      </Info>
    );
  }

  renderUnsupportedMessage() {
    return (
      <Info tag="li" icon="gamepad">
        Your browser does not support gamepad input.
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
    const {timer, state: {gamepads}} = this;
    return (
      <ul className="gamepad-list">
        {timer == null && this.renderLoadingMessage()}
        {timer < 0 && this.renderUnsupportedMessage()}
        {timer > 0 && !gamepads.length && this.renderEmptyMessage()}
        {gamepads.map(this.renderGamepad)}
      </ul>
    );
  }

}
