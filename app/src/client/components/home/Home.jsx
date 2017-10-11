import React from 'react';
import PropTypes from 'prop-types';
import {Theme} from '../../enums';
import {Button, Icon, Logo, Main, Tooltip} from '../common';
import {getEmulatorPath, getLibraryPath, getSettingsPath, getAboutPath} from '../../routes';
import HomeLink from './HomeLink';
import connect from './connect';
import './Home.css';

const Home = ({theme, onThemeSwitch}) => (
  <Main className="home">
    <Logo className="home-logo"/>
    <h1 className="home-heading">cfxnes</h1>
    <p>A <abbr title="Nintendo Entertainment System">NES</abbr> emulator running in your web browser.</p>
    <nav className="home-nav">
      <HomeLink to={getEmulatorPath()} icon="gamepad" label="Play a game"/>
      <HomeLink to={getLibraryPath()} icon="book" label="Browse library"/>
      <HomeLink to={getSettingsPath()} icon="cog" label="Change settings"/>
      <HomeLink to={getAboutPath()} icon="question-circle" label="More info"/>
    </nav>
    <Button className="home-theme-switch" borderless onClick={onThemeSwitch}>
      <Icon name={Theme.getIcon(theme)} size="2x"/>
      <Tooltip placement="left">{Theme.getLabel(theme)}</Tooltip>
    </Button>
  </Main>
);

Home.propTypes = {
  theme: PropTypes.oneOf(Theme.values).isRequired,
  onThemeSwitch: PropTypes.func.isRequired,
};

export default connect(Home);
