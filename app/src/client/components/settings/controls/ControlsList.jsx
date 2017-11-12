import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {keysValuePropType} from '../../common';
import {Port} from '../../../enums';
import Controls from './Controls';
import './ControlsList.css';

export const controlsPropType = keysValuePropType(Port.values, Controls.propTypes.controls);

export default class ControlsList extends PureComponent {

  static propTypes = {
    controls: controlsPropType.isRequired,
    onDeviceChange: PropTypes.func,
    onInputAdd: PropTypes.func,
    onInputRemove: PropTypes.func,
  };

  static defaultProps = {
    onDeviceChange: null,
    onInputAdd: null,
    onInputRemove: null,
  };

  renderControls = port => {
    const {controls, onDeviceChange, onInputAdd, onInputRemove} = this.props;
    return <Controls key={port} port={port} controls={controls[port]}
                     onDeviceChange={onDeviceChange}
                     onInputAdd={onInputAdd}
                     onInputRemove={onInputRemove}/>;
  }

  render() {
    return (
      <ul className="controls-list">
        {Port.values.map(this.renderControls)}
      </ul>
    );
  }

}
