import React from 'react';
import PropTypes from 'prop-types';
import {Theme} from '../../enums';
import {Button, Icon, Logo, Main, Tooltip} from '../common';
import {EMULATOR_PATH, LIBRARY_PATH, SETTINGS_PATH, ABOUT_PATH} from '../../routes';
import HomeLink from './HomeLink';
import connect from './connect';
import './Home.css';

const Home = ({theme, onThemeSwitch}) => (
  <Main className="home">
    <Logo className="home-logo"/>
    <h1 className="home-heading">cfxnes</h1>
    <p>Javascript <abbr title="Nintendo Entertainment System">NES</abbr> emulator and emulation library.</p>
    <nav className="home-nav">
      <HomeLink to={EMULATOR_PATH} icon="gamepad" label="Play a game"/>
      <HomeLink to={LIBRARY_PATH} icon="book" label="Browse library"/>
      <HomeLink to={SETTINGS_PATH} icon="cog" label="Change settings"/>
      <HomeLink to={ABOUT_PATH} icon="question-circle" label="More info"/>
    </nav>
    <Button className="home-theme-switch" borderless onClick={onThemeSwitch} aria-hidden="true">
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
