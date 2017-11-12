import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Input, {FILE} from './Input';
import './FileInput.css';

export default class FileInput extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    hiddenProxy: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    className: null,
    hiddenProxy: false,
    onChange: null,
  }

  handleChange = (value, event) => {
    const {hiddenProxy, onChange} = this.props;

    if (hiddenProxy) {
      event.target.blur();
      event.preventDefault();
      event.stopPropagation();
    }

    if (onChange) {
      onChange(value, event);
    }
  };

  render() {
    const {className, hiddenProxy, onChange, ...attrs} = this.props;
    const fullClassName = classNames(className, {'hidden-proxy': hiddenProxy});
    return <Input type={FILE} className={fullClassName} aria-hidden={hiddenProxy}
                  onChange={this.handleChange} {...attrs}/>;
  }

}

