import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";

export default class DummyScreen extends React.Component {

  render() {
    return (
      <View style={{ 'paddingTop': 70, 'backgroundColor': '#fff', 'flex': 1 }}>
        <Text style={styles.mandatoryErrorText}>{GLOBALS.DUMMY_SCREEN_TITLE}</Text>

        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          labelName={"name"} />
      </View>
    )
  }
}