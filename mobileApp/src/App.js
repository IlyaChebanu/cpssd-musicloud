/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Fragment, useEffect } from "react";
import { Provider } from "react-redux";
import store from "./Store";
import Navigator, { middleware } from "./navigation/navigator";
import { StatusBar } from "react-native";
import Orientation from 'react-native-orientation';
import SplashScreen from 'react-native-splash-screen';
import OfflineNotice from './components/offlineNotice/offlineNotice'

// console.disableYellowBox = true;

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    Orientation.lockToPortrait();
  }, []);

  return (
    <Fragment>
      <StatusBar barStyle="light-content" />
      <Provider store={store}>
        <Navigator />
        <OfflineNotice />
      </Provider>
    </Fragment>
  )
}

export default App;
