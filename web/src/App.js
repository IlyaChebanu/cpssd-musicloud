import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import history from './history';
import { ReactComponent as Blob1 } from './assets/blob1.svg';
import { ReactComponent as Blob2 } from './assets/blob2.svg';
import Login from './pages/Login';
import Discover from './pages/Discover';
import Registration from './pages/Registration';
import Reverify from './pages/Reverify';
import Studio from './pages/Studio';


const App = () => {
  return (
    <Router history={history}>
      <Blob1 className='blob1'/>
      <Blob2 className='blob2'/>
      <Switch>
        <Redirect from='/' to='/login' exact={true}/>
        <Route path="/login" component={Login}/>
        <Route path='/registration' component={Registration}/>
        <Route path='/verify' component={Reverify}/>
        <Route path='/discover' component={Discover}/>
        <Route path='/studio' component={Studio}/>
      </Switch>
    </Router>
  );
}

export default App;
