import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import {App, Home, Header, Toolbar, Emulator, EmulatorToolbar, Library, Settings, About} from './components';
import {ROOT_PATH, NON_ROOT_PATH, EMULATOR_PATH, LIBRARY_PATH, SETTINGS_PATH, ABOUT_PATH} from './routes';
import store from './store';
import './Root.css';

const HeaderWithContent = () => (
  <Header>
    <Switch>
      <Route path={EMULATOR_PATH} component={EmulatorToolbar}/>
      <Route component={Toolbar}/>
    </Switch>
  </Header>
);

const RootRedirect = () => (
  <Redirect to={ROOT_PATH}/>
);

export default () => (
  <Provider store={store}>
    <BrowserRouter>
      <App>
        <Route path={NON_ROOT_PATH} component={HeaderWithContent}/>
        <Switch>
          <Route path={ROOT_PATH} exact component={Home}/>
          <Route path={EMULATOR_PATH} component={Emulator}/>
          <Route path={LIBRARY_PATH} component={Library}/>
          <Route path={SETTINGS_PATH} component={Settings}/>
          <Route path={ABOUT_PATH} component={About}/>
          <Route component={RootRedirect}/>
        </Switch>
      </App>
    </BrowserRouter>
  </Provider>
);
