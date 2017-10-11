import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {optionPropTypes, optionsPropType} from './propTypes';
import './Select.css';

const Option = ({label, value}) => (
  <option key={value} value={value}>{label}</option>
);

Option.propTypes = optionPropTypes;

export default class Select extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    options: optionsPropType.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    value: null,
    onChange: null,
  };

  handleChange = event => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(event.target.value, event);
    }
  };

  render() {
    const {className, options, value, onChange, ...attrs} = this.props;
    return (
      <select className={classNames('select', className)}
              value={value} onChange={this.handleChange} {...attrs}>
        {options.map(Option)}
      </select>
    );
  }

}
