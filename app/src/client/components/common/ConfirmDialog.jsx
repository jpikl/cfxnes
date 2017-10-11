import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Modal from './Modal';

export default class ConfirmDialog extends PureComponent {

  static propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirm: PropTypes.string,
    cancel: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    confirm: 'Yes',
    cancel: 'No',
    onConfirm: null,
    onCancel: null,
  };

  initConfirmButton = button => {
    if (button) {
      button.focus();
    }
  }

  render() {
    const {title, message, confirm, cancel, onConfirm, onCancel} = this.props;
    return (
      <Modal className="confirm-dialog" onEscapeKeyDown={onCancel}>
        <Modal.Header onClose={onCancel}>{title}</Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button onClick={onCancel}>{cancel}</Button>
          <Button primary onClick={onConfirm} refButton={this.initConfirmButton}>{confirm}</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
