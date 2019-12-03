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
import Orientation from 'react-native-orientation';
import Pushy from 'pushy-react-native';
import { PermissionsAndroid } from 'react-native';


Pushy.setNotificationListener(async (data) => {
  // Print notification payload data
  if (__DEV__) {
    console.log('Received notification: ' + JSON.stringify(data));
  }

  // Notification title
  let notificationTitle = data.title || 'Musicloud';

  // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
  let notificationText = data.message || 'notification';

  // Display basic system notification
  Pushy.notify(notificationTitle, notificationText, data);
});

// console.disableYellowBox = true;
type Props = {};
export default class App extends Component<Props> {

  componentWillMount() {
    Orientation.lockToPortrait();
  }

  componentDidMount() {
    // Start the Pushy service
    Pushy.listen();

    
  }

  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}

