import React from 'react';
import './App.css';
import {
  Router, Route, Switch, Redirect,
} from 'react-router-dom';
import history from './history';
import { ReactComponent as Blob1 } from './assets/blob1.svg';
import { ReactComponent as Blob2 } from './assets/blob2.svg';
import NotificationManager from './components/NotificationManager/NotificationManager';
import Login from './pages/Login/Login';
import Discover from './pages/Discover/Discover';
import Registration from './pages/Registration/Registration';
import Reverify from './pages/Reverify/Reverify';
import Studio from './pages/Studio/Studio';
import Profile from './pages/Profile/Profile';


const App = () => (
  <Router history={history}>
    <Blob1 className="blob1" />
    <Blob2 className="blob2" />
    <NotificationManager />
    <Switch>
      <Redirect from="/" to="/login" exact />
      <Route path="/login" component={Login} />
      <Route path="/registration" component={Registration} />
      <Route path="/verify" component={Reverify} />
      <Route path="/discover" component={Discover} />
      <Route path="/studio" component={Studio} />
      <Route path="/profile" component={Profile} />
    </Switch>
  </Router>
);

export default App;
