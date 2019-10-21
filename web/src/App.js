import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import history from './history';
import { ReactComponent as Blob1 } from './assets/blob1.svg';
import { ReactComponent as Blob2 } from './assets/blob2.svg';
import LoginPage from './pages/Login';
import Discover from './pages/Discover';
import RegistrationPage from './pages/Registration';
import ReverifyPage from './pages/Reverify';


const App = () => {
  return (
    <Router history={history}>
      <Blob1 className='blob1'/>
      <Blob2 className='blob2'/>
      <Switch>
        <Route path="/login" component={LoginPage}/>
        <Route path='/registration' component={RegistrationPage}/>
        <Route path='/verify' component={ReverifyPage}/>
        <Route path='/discover' component={Discover}/>
      </Switch>
    </Router>
  );
}

export default App;
