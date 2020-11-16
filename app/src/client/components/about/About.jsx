import React, {PureComponent} from 'react';
import {LinkButton, Logo, Main} from '../common';
import Changelog from './Changelog';
import cfxnes from 'cfxnes';
import './About.css';

export default class About extends PureComponent {

  state = {
    changelogVisible: false,
  };

  handleShowChangelog = () => {
    this.setState({changelogVisible: true});
  };

  render() {
    return (
      <Main className="about">
        <div className="about-section">
          <Logo className="about-logo"/>
        </div>
        <article className="about-section">
          <h1>cfxnes ({cfxnes.version})</h1>
          <p>JavaScript <abbr title="Nintendo Entertainment System">NES</abbr> emulator and emulation library.</p>
          <p>The source code is available at <a href="https://github.com/jpikl/cfxnes">github</a> and licensed under the MIT License.</p>
          <p>Copyright © 2014 Jan Pikl</p>
          {this.state.changelogVisible
            ? <Changelog/>
            : <LinkButton onClick={this.handleShowChangelog}>Show change log</LinkButton>
          }
        </article>
      </Main>
    );
  }

}
