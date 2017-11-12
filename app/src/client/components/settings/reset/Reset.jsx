import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, ConfirmDialog} from '../../common';
import {ActionState} from '../../../enums';
import './Reset.css';

export default class Reset extends PureComponent {

  static propTypes = {
    icon: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    descriptionId: PropTypes.string.isRequired,
    confirmTitle: PropTypes.string.isRequired,
    confirmMessage: PropTypes.string.isRequired,
    progressMessage: PropTypes.string,
    failureMessage: PropTypes.string,
    state: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(ActionState.values),
    ]).isRequired,
    onConfirm: PropTypes.func.isRequired,
  }

  static defaultProps = {
    progressMessage: null,
    failureMessage: null,
  }

  state = {
    confirmVisible: false,
  };

  handleAction = () => {
    this.setState({confirmVisible: true});
  }

  handleConfirm = () => {
    this.setState({confirmVisible: false});
    this.props.onConfirm();
  }

  handleCancel = () => {
    this.setState({confirmVisible: false});
  }

  renderConfirm() {
    const {action, confirmTitle, confirmMessage} = this.props;

    return <ConfirmDialog title={confirmTitle}
                          message={confirmMessage}
                          confirm={action}
                          cancel="Cancel"
                          onConfirm={this.handleConfirm}
                          onCancel={this.handleCancel}/>;
  }

  renderButton() {
    const {icon, state, action, descriptionId, progressMessage, failureMessage} = this.props;

    if (state === ActionState.STARTED) {
      return (
        <Button disabled aria-label={action} aria-describedby={descriptionId}>
          <Icon name="circle-o-notch" spin/> {progressMessage}
        </Button>
      );
    }

    if (state === ActionState.FAILURE) {
      return (
        <Button disabled aria-label={action} aria-describedby={descriptionId}>
          <Icon name="exclamation-triangle"/> {failureMessage}
        </Button>
      );
    }

    if (state === ActionState.SUCCESS || state === true) {
      return (
        <Button disabled aria-label={action} aria-describedby={descriptionId}>
          <Icon name="check"/> Done
        </Button>
      );
    }

    return (
      <Button onClick={this.handleAction} aria-describedby={descriptionId}>
        <Icon name={icon}/> {action}
      </Button>
    );
  }

  render() {
    const {confirmVisible} = this.state;
    const {description, descriptionId} = this.props;

    return (
      <div className="reset">
        <div className="reset-action">{this.renderButton()}</div>
        <div className="reset-description" id={descriptionId}>{description}</div>
        <div>{confirmVisible && this.renderConfirm()}</div>
      </div>
    );
  }

}
