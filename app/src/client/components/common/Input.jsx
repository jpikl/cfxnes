import React, {PureComponent} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './Input.css';

const CHECKBOX = 'checkbox';
const FILE = 'file';
const NUMBER = 'number';
const RADIO = 'radio';
const RANGE = 'range';
const SEARCH = 'search';
const TEXT = 'text';

const types = [CHECKBOX, FILE, NUMBER, RADIO, RANGE, SEARCH, TEXT];

export {CHECKBOX, FILE, NUMBER, RADIO, RANGE, SEARCH, TEXT};

function getInputValue(input) {
  const {type} = input;

  if (type === FILE) {
    const {multiple, files} = input;
    if (multiple) {
      return files || [];
    }
    return (files && files[0]) || null;
  }

  if (type === CHECKBOX) {
    return input.checked;
  }

  if (type === NUMBER || type === RANGE) {
    return parseFloat(input.value);
  }

  return input.value;
}

export default class Input extends PureComponent {

  static propTypes = {
    type: PropTypes.oneOf(types).isRequired,
    className: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    refInput: PropTypes.func,
    unStyled: PropTypes.bool,
  };

  static defaultProps = {
    className: null,
    value: undefined,
    onChange: null,
    refInput: null,
    unStyled: false,
  };

  handleChange = event => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(getInputValue(event.target), event);
    }
  };

  render() {
    const {type, className, value, onChange, refInput, unStyled, ...attrs} = this.props;
    return <input type={type} ref={refInput} {...attrs}
                  className={classNames(className, {input: !unStyled})}
                  value={type !== CHECKBOX ? value : undefined}
                  checked={type === CHECKBOX && value}
                  onChange={this.handleChange}/>;
  }

}
