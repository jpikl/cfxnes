import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Icon, LinkButton, Tooltip} from '../../common';
import './GamepadMapButton.css';

export default class GamepadMapButton extends PureComponent {

  static propTypes = {
    index: PropTypes.number.isRequired,
    port: PropTypes.number.isRequired,
    onMap: PropTypes.func.isRequired,
  };

  handleClick = () => {
    const {index, port, onMap} = this.props;
    onMap(index, port);
  };

  render() {
    const {index, port} = this.props;
    const labelId = `gamepad-map-button-label-${index}-${port}`;
    return (
      <LinkButton className="gamepad-map-button" aria-labelledby={labelId}
                  onClick={this.handleClick}>
        <Icon name="wrench"/><sub aria-hidden="true">{port}</sub>
        <Tooltip id={labelId}>Use this gamepad as controller {port}</Tooltip>
      </LinkButton>
    );
  }

}
