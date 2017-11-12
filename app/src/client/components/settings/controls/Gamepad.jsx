import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Icon, Info, Tooltip} from '../../common';
import {Port} from '../../../enums';
import GamepadMapButton from './GamepadMapButton';
import './Gamepad.css';

export default class Gamepad extends PureComponent {

  static propTypes = {
    gamepad: PropTypes.shape({
      index: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      mapping: PropTypes.string,
    }).isRequired,
    onMap: PropTypes.func.isRequired,
  };

  renderGamepadMapButton = port => {
    const {gamepad: {index}, onMap} = this.props;
    return <GamepadMapButton key={port} index={index} port={port} onMap={onMap}/>;
  };

  renderUnrecognizedLayoutInfo() {
    return (
      <Tooltip.Container hoverTrigger>
        <Icon name="info-circle"/>
        <Tooltip className="gamepad-tooltip">
          Your browser could not recognize layout of the gamepad.
          Auto-mapping is not available.
        </Tooltip>
      </Tooltip.Container>
    );
  }

  render() {
    const {gamepad: {index, id, mapping}} = this.props;

    const contentAfter = mapping === 'standard'
      ? Port.values.map(this.renderGamepadMapButton)
      : this.renderUnrecognizedLayoutInfo();

    return (
      <Info tag="li" className="gamepad" icon="gamepad">
        {index}: {id} {contentAfter}
      </Info>
    );
  }

}
