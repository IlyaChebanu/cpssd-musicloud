/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { Provider } from "react-redux";
import store from "./Store";
import Navigator, { middleware } from "./navigation/navigator";
import { Platform, StyleSheet, Text, View } from "react-native";

type Props = {};
export default class App extends Component<Props> {
  render() {
    // console.disableYellowBox = true;
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}

