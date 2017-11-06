import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from './Button';
import Icon from './Icon';
import NumberInput from './NumberInput';
import './NumberSelect.css';

export default class NumberSelect extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    inputId: PropTypes.string,
    inputLabel: PropTypes.string,
    disabled: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    inputId: null,
    inputLabel: null,
    disabled: false,
    min: null,
    max: null,
    step: 1,
    value: 0,
    onChange: null,
  };

  handleDecrease = () => {
    this.updateValue(-this.props.step);
  };

  handleIncrease = () => {
    this.updateValue(this.props.step);
  };

  updateValue = increment => {
    const {value, onChange} = this.props;
    if (onChange) {
      onChange(value + increment);
    }
  }

  renderMinusButton() {
    const {min, step, value} = this.props;
    return (
      <Button className="number-select-minus" borderless tabIndex="-1"
              disabled={min != null && value - step < min}
              title="Decrease" onClick={this.handleDecrease}>
        <Icon name="minus"/>
      </Button>
    );
  }

  renderPlusButton() {
    const {max, step, value} = this.props;
    return (
      <Button className="number-select-plus" borderless tabIndex="-1"
              disabled={max != null && value + step > max}
              title="Increase" onClick={this.handleIncrease}>
        <Icon name="plus"/>
      </Button>
    );
  }

  render() {
    const {className, inputId, inputLabel, disabled, min, max, step, value, onChange, ...attrs} = this.props;
    return (
      <div className={classNames('number-select', className)} {...attrs}>
        <NumberInput className="number-select-input" id={inputId}
                     disabled={disabled} aria-label={inputLabel}
                     min={min} max={max} value={value} onChange={onChange}/>
        {!disabled && this.renderMinusButton()}
        {!disabled && this.renderPlusButton()}
      </div>
    );
  }

}
