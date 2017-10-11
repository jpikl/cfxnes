import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from './Button';
import Icon from './Icon';
import './Message.css';

const INFO = 'info';
const ERROR = 'error';

const Message = ({className, type, onClose, children, ...attrs}) => (
  <div className={classNames('message', type, className)} {...attrs}>
    <div className="message-body">
      {children}
    </div>
    {onClose && (
      <Button className="message-close" borderless title="Close" onClick={onClose}>
        <Icon name="times"/>
      </Button>
    )}
  </div>
);

Message.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf([INFO, ERROR]),
  onClose: PropTypes.func,
  children: PropTypes.node,
};

Message.defaultProps = {
  className: null,
  type: INFO,
  onClose: null,
  children: null,
};

export default Message;
