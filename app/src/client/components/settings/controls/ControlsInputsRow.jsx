import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, Tooltip} from '../../common';
import {Source} from '../../../enums';
import DeviceInput, {deviceInputPropType} from './DeviceInput';
import SourceInput, {sourceInputPropType} from './SourceInput';
import './ControlsInputsRow.css';

export default class ControlsInputsRow extends PureComponent {

  static propTypes = {
    deviceInput: deviceInputPropType.isRequired,
    sourceInputs: PropTypes.arrayOf(sourceInputPropType).isRequired,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
  };

  static defaultProps = {
    onAdd: null,
    onRemove: null,
  };

  handleAdd = () => {
    const {deviceInput, onAdd} = this.props;
    onAdd(deviceInput);
  };

  handleRemove = sourceInput => {
    const {onRemove} = this.props;
    onRemove(sourceInput);
  };

  renderSourceInput = input => {
    const {onRemove} = this.props;
    const handleRemove = onRemove && this.handleRemove;

    return <SourceInput key={Source.getInputId(input)}
                        input={input}
                        onRemove={handleRemove}/>;
  }

  renderUnsetInput() {
    return <i className="source-input-unset">Unset</i>;
  }

  renderAddButton() {
    return (
      <dd className="source-input-add">
        <Button borderless onClick={this.handleAdd} aria-label="Bind new input">
          <Icon name="plus-square"/>
          <Tooltip placement="right" aria-hidden="true">Bind new input</Tooltip>
        </Button>
      </dd>
    );
  }

  render() {
    const {deviceInput, sourceInputs, onAdd} = this.props;
    return (
      <dl className="controls-inputs-row">
        <DeviceInput input={deviceInput}/>
        <dd className="source-inputs">
          {sourceInputs.map(this.renderSourceInput)}
          {!sourceInputs.length && this.renderUnsetInput()}
        </dd>
        {onAdd && this.renderAddButton()}
      </dl>
    );
  }

}
