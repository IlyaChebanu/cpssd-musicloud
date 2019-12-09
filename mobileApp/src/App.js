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
import Pushy from 'pushy-react-native';
import { PermissionsAndroid } from 'react-native';

console.disableYellowBox = true;

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

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    Pushy.listen();
    Pushy.setNotificationIcon('ic_notification');
    Orientation.lockToPortrait();
  }, []);

  return (
    <Fragment>
      <StatusBar barStyle="light-content" />
      <Provider store={store}>
        <Navigator />
      </Provider>
    </Fragment>
  )
}

export default App;
