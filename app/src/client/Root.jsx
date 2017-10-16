import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import {App, Home, Header, Toolbar, Emulator, EmulatorToolbar, Library, Settings, About} from './components';
import {ROOT_PATH, ROOT_EXPR, NON_ROOT_EXPR, EMULATOR_EXPR, LIBRARY_EXPR, SETTINGS_EXPR, ABOUT_EXPR} from './routes';
import store from './store';
import './Root.css';

const HeaderWithContent = () => (
  <Header>
    <Switch>
      <Route path={EMULATOR_EXPR} component={EmulatorToolbar}/>
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
        <Route path={NON_ROOT_EXPR} component={HeaderWithContent}/>
        <Switch>
          <Route exact path={ROOT_EXPR} component={Home}/>
          <Route path={EMULATOR_EXPR} component={Emulator}/>
          <Route path={LIBRARY_EXPR} component={Library}/>
          <Route path={SETTINGS_EXPR} component={Settings}/>
          <Route path={ABOUT_EXPR} component={About}/>
          <Route component={RootRedirect}/>
        </Switch>
      </App>
    </BrowserRouter>
  </Provider>
);
