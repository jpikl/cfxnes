import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Main} from '../common';
import {panelIds, panels, isValidPanelId, defaultPanelId} from './panels';
import connect from './connect';

class Settings extends PureComponent {

  static propTypes = {
    activePanelId: PropTypes.string,
    routePanelId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    onActivePanelChange: PropTypes.func.isRequired,
    onRoutePanelChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activePanelId: null,
    routePanelId: null,
  };

  componentDidMount() {
    this.handlePropsChange(this.props);
  }

  componentDidUpdate(props) {
    this.handlePropsChange(props);
  }

  handlePropsChange(props) {
    const {activePanelId, routePanelId, onActivePanelChange, onRoutePanelChange} = props;

    if (isValidPanelId(routePanelId)) {
      if (routePanelId !== activePanelId) {
        onActivePanelChange(routePanelId);
      }
    } else if (isValidPanelId(activePanelId)) {
      onRoutePanelChange(activePanelId);
    } else {
      onActivePanelChange(defaultPanelId);
      onRoutePanelChange(defaultPanelId);
    }
  }

  handlePanelActivation = id => {
    const {onActivePanelChange, onRoutePanelChange} = this.props;
    onActivePanelChange(id);
    onRoutePanelChange(id);
  };

  renderPanel = id => {
    const {activePanelId} = this.props;
    const active = id === activePanelId;
    const Panel = panels[id];
    return <Panel key={id} active={active} onActivate={this.handlePanelActivation}/>;
  }

  render() {
    return (
      <Main className="settings" wrapContent>
        <h1>Settings</h1>
        {panelIds.map(this.renderPanel)}
      </Main>
    );
  }

}

export default connect(Settings);
