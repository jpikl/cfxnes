import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Icon, LinkButton, Panel} from '../common';

export default class SettingsPanel extends PureComponent {

  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onActivate: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  handleHeaderClick = () => {
    const {id, onActivate} = this.props;
    onActivate(id);
  };

  render() {
    const {id, title, icon, active, children} = this.props;
    return (
      <Panel className={classNames('settings-panel', `${id}-settings`)} collapsed={!active}>
        <Panel.Header>
          <Panel.Title>
            <LinkButton onClick={this.handleHeaderClick}>
              <Icon name={icon} fixedWidth spaceAfter/>{title}
            </LinkButton>
          </Panel.Title>
        </Panel.Header>
        <Panel.Body>
          {children}
        </Panel.Body>
      </Panel>
    );
  }

}
