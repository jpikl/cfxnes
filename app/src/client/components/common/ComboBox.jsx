import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import Select from './Select';
import {optionsPropType} from './propTypes';
import './ComboBox.css';

const ComboBox = ({className, selectId, disabled, options, value, onChange, ...attrs}) => (
  <div className={classNames('combo-box', className)} {...attrs}>
    <Select className="combo-box-select" id={selectId} disabled={disabled}
            options={options} value={value} onChange={onChange}/>
    {!disabled && <Icon className="combo-box-caret" name="caret-down"/>}
  </div>
);

ComboBox.propTypes = {
  className: PropTypes.string,
  selectId: PropTypes.string,
  disabled: PropTypes.bool,
  options: optionsPropType.isRequired, // eslint-disable-line react/no-typos
  value: PropTypes.string,
  onChange: PropTypes.func,
};

ComboBox.defaultProps = {
  className: null,
  selectId: null,
  disabled: false,
  value: null,
  onChange: null,
};

export default ComboBox;
