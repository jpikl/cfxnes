import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {findFocusableDescendants} from '../../common';
import {KeyCode} from '../../keyboard';
import Button from './Button';
import Icon from './Icon';
import './Modal.css';

export default class Modal extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    onEscapeKeyDown: PropTypes.func,
    children: PropTypes.node,
  };

  static defaultProps = {
    className: null,
    onEscapeKeyDown: null,
    children: null,
  };

  componentDidMount() {
    const {activeElement} = document;
    if (activeElement) {
      activeElement.blur();
    }
    addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    removeEventListener('keydown', this.handleKeyDown);
  }

  setModal = modal => {
    this.modal = modal;
  }

  handleKeyDown = event => {
    switch (event.keyCode) {
      case KeyCode.TAB:
        this.handleTabKeyDown(event);
        break;

      case KeyCode.ESC:
        this.handleEscapeKeyDown(event);
        break;
    }
  }

  handleTabKeyDown(event) {
    const {activeElement} = document;
    const elements = findFocusableDescendants(this.modal);

    if (elements.length) {
      const {shiftKey} = event;
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      let targetElement = null;

      if (elements.indexOf(activeElement) >= 0) {
        if (activeElement === lastElement && !shiftKey) {
          targetElement = firstElement;
        } else if (activeElement === firstElement && shiftKey) {
          targetElement = lastElement;
        }
      } else {
        targetElement = shiftKey ? lastElement : firstElement;
      }

      if (targetElement) {
        targetElement.focus();
        event.preventDefault();
      }
    } else if (activeElement) {
      activeElement.blur();
      event.preventDefault();
    }
  }

  handleEscapeKeyDown(event) {
    const {onEscapeKeyDown} = this.props;
    if (onEscapeKeyDown) {
      onEscapeKeyDown(event);
    }
  }

  render() {
    const {className, onEscapeKeyDown, children, ...attrs} = this.props;
    return (
      <div className="modal-overlay">
        <div className={classNames('modal', className)} ref={this.setModal}
             role="dialog" aria-modal="true" {...attrs}>
          {children}
        </div>
      </div>
    );
  }

}

Modal.Header = ({className, onClose, children, ...attrs}) => (
  <div className={classNames('modal-header', className)} {...attrs}>
    <h4 className="modal-title">{children}</h4>
    {onClose && (
      <Button className="message-close" borderless title="Close" onClick={onClose}>
        <Icon name="times"/>
      </Button>
    )}
  </div>
);

Modal.Header.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
};

Modal.Header.defaultProps = {
  className: null,
  onClose: null,
  children: null,
};

Modal.Body = ({className, children, ...attrs}) => (
  <div className={classNames('modal-body', className)} {...attrs}>
    {children}
  </div>
);

Modal.Body.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Modal.Body.defaultProps = {
  className: null,
  children: null,
};

Modal.Footer = ({className, children, ...attrs}) => (
  <div className={classNames('modal-footer', className)} {...attrs}>
    {children}
  </div>
);

Modal.Footer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Modal.Footer.defaultProps = {
  className: null,
  children: null,
};
