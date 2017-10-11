import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon} from '../common';
import {addKeyDownListener, removeKeyDownListener} from '../../keyboard';
import ToolTooltip from './ToolTooltip';

export default class ToolButton extends PureComponent {

  static propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string,
    keyCode: PropTypes.number,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    label: null,
    keyCode: null,
    onClick: null,
  };

  componentWillMount() {
    addKeyDownListener(this.handleKeyDown);
  }

  componentWillUnmount() {
    removeKeyDownListener(this.handleKeyDown);
  }

  handleKeyDown = event => {
    if (event.altKey) {
      const {onClick, keyCode} = this.props;
      if (onClick && keyCode && keyCode === event.keyCode) {
        onClick();
        return true;
      }
    }
    return false;
  };

  render() {
    const {icon, label, keyCode, ...attrs} = this.props;
    return (
      <Button className="tool-button" {...attrs}>
        <Icon name={icon}/>
        {(label || keyCode) && (
          <ToolTooltip placement="bottom" label={label} keyCode={keyCode}/>
        )}
      </Button>
    );
  }

}
