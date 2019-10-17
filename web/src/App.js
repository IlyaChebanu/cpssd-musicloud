import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/Login';
import { ReactComponent as Blob1 } from './assets/blob1.svg';
import { ReactComponent as Blob2 } from './assets/blob2.svg';


function App() {
  return (
    <Router>
      <Blob1 className='blob1'/>
      <Blob2 className='blob2'/>
      <Switch>
        <Route path="/login">
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
