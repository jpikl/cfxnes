import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class LinkButton extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node,
  };

  static defaultProps = {
    className: null,
    onClick: null,
    children: null,
  };

  handleClick = event => {
    event.preventDefault();
    const {onClick} = this.props;
    if (onClick) {
      onClick(event);
    }
  };

  render() {
    const {className, children, ...attrs} = this.props;
    return (
      <a {...attrs} href="#" onClick={this.handleClick} role="button"
         className={classNames('link-button', className)}>
        {children}
      </a>
    );
  }

}
