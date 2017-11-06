import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {getUniqueId} from '../../common';
import Button from './Button';
import Icon from './Icon';
import SearchInput from './SearchInput';
import './Search.css';

export default class Search extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    inputId: PropTypes.string,
    inputLabel: PropTypes.string,
    refInput: PropTypes.func,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    inputId: null,
    inputLabel: null,
    refInput: null,
    disabled: false,
    placeholder: null,
    value: null,
    onChange: null,
  };

  handleClear = () => {
    const {onChange} = this.props;
    if (onChange) {
      onChange('');
    }
  };

  render() {
    const {className, inputId, inputLabel, refInput, disabled, placeholder, value, onChange, ...attrs} = this.props;
    const finalInputId = inputId || this.id || (this.id = getUniqueId());
    return (
      <div className={classNames('search', className)} {...attrs}>
        <Icon className="search-icon" name="search" title="Search" labelFor={finalInputId}/>
        <SearchInput className="search-input" id={finalInputId} refInput={refInput}
                     disabled={disabled} placeholder={placeholder} aria-label={inputLabel}
                     value={value} onChange={onChange}/>
        {!disabled && value && (
          <Button className="search-clear" borderless tabIndex="-1"
                  title="Clear" onClick={this.handleClear}>
            <Icon name="times"/>
          </Button>
        )}
      </div>
    );
  }

}
