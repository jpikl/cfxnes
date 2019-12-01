import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Meter from './Meter';
import Tooltip from './Tooltip';
import RangeInput from './RangeInput';
import './Slider.css';

const getClassName = (className, vertical, marksFormat) => classNames(
  'slider',
  className,
  vertical ? 'vertical' : 'horizontal',
  {marked: marksFormat != null},
);

const getMarks = (min, max, step, format) => {
  const marks = [];
  const count = Math.floor((max - min) / step) + 1;
  for (let i = 0; i < count; i++) {
    marks[i] = format(min + (i * step));
  }
  return marks;
};

const getTooltipPosition = (vertical, min, max, value) => {
  const ratio = (value - min) / (max - min);
  return vertical ? 1 - ratio : ratio;
};

const Slider = ({
  className, inputId, inputLabel, vertical, filled, disabled, min, max,
  step, value, marksFormat, tooltipFormat, onChange, ...attrs
}) => (
  <div className={getClassName(className, vertical, marksFormat)} {...attrs}>
    <RangeInput className="slider-input" id={inputId} aria-label={inputLabel}
                disabled={disabled} filled={filled}
                min={min} max={max} step={step}
                value={value} onChange={onChange}/>
    {(marksFormat || tooltipFormat) && (
      <div className="slider-decorations" aria-hidden="true">
        {marksFormat && (
          <Meter className="slider-meter" vertical={vertical}
                 marks={getMarks(min, max, step, marksFormat)}/>
        )}
        {tooltipFormat && (
          <div className="slider-tooltip-container">
            <Tooltip placement={vertical ? 'right' : 'top'}
                     position={getTooltipPosition(vertical, min, max, value)}>
              {tooltipFormat(value)}
            </Tooltip>
          </div>
        )}
      </div>
    )}
  </div>
);

Slider.propTypes = {
  className: PropTypes.string,
  inputId: PropTypes.string,
  inputLabel: PropTypes.string,
  vertical: PropTypes.bool,
  filled: PropTypes.bool,
  disabled: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  marksFormat: PropTypes.func,
  tooltipFormat: PropTypes.func,
  onChange: PropTypes.func,
};

Slider.defaultProps = {
  className: null,
  inputId: null,
  inputLabel: null,
  vertical: false,
  filled: false,
  disabled: false,
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  marksFormat: null,
  tooltipFormat: null,
  onChange: null,
};

export default Slider;
