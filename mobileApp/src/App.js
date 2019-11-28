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
import { Platform, StyleSheet, Text, View } from "react-native";
import Orientation from 'react-native-orientation';
import SplashScreen from 'react-native-splash-screen';

console.disableYellowBox = true;

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    Orientation.lockToPortrait();
  }, []);

  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  )
}

export default App;
