import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, Tooltip} from '../../common';
import {Source} from '../../../enums';
import './SourceInput.css';

export const sourceInputPropType = PropTypes.shape({
  source: Source.isSource,
  inputName: PropTypes.string,
});

export default class SourceInput extends PureComponent {

  static propTypes = {
    input: sourceInputPropType.isRequired,
    onRemove: PropTypes.func,
  };

  static defaultProps = {
    onRemove: null,
  };

  handleRemoveClick = () => {
    const {input, onRemove} = this.props;
    onRemove(input);
  }

  renderRemoveButton() {
    return (
      <Button className="source-input-remove" borderless
              onClick={this.handleRemoveClick}
              aria-label="Remove input">
        <Icon name="trash"/>
        <Tooltip>Remove</Tooltip>
      </Button>
    );
  }

  render() {
    const {input, onRemove} = this.props;
    const icon = Source.getInputIcon(input);
    const label = Source.getInputLabel(input);

    return (
      <div className="source-input">
        <Icon className="source-input-icon" name={icon}/>
        <span className="source-input-label">{label}</span>
        {onRemove && this.renderRemoveButton()}
      </div>
    );
  }

}
