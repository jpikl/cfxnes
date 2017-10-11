import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withRouter} from 'react-router';
import {getEmulatorPath, getLibraryPath, getSettingsPath, getAboutPath} from '../../routes';
import Brand from './Brand';
import Nav from './Nav';
import NavLink from './NavLink';
import './Header.css';

class Header extends PureComponent {

  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  state = {
    collapsed: true,
  };

  handleCollapsedChange = () => {
    this.setState({collapsed: !this.state.collapsed});
  };

  render() {
    const {children} = this.props;
    const {collapsed} = this.state;

    return (
      <header className={classNames('header', {collapsed})}>
        <Brand collapsed={collapsed} onCollapsedChange={this.handleCollapsedChange}/>
        <Nav className="header-main-nav">
          <NavLink to={getEmulatorPath()} icon="gamepad" label="Emulator"/>
          <NavLink to={getLibraryPath()} icon="book" label="Library"/>
          <NavLink to={getSettingsPath()} icon="cog" label="Settings"/>
        </Nav>
        <Nav className="header-help-nav">
          <NavLink to={getAboutPath()} icon="question-circle" label="About"/>
        </Nav>
        {children}
      </header>
    );
  }

}

export default withRouter(Header);
