import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";

export default class DummyScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={{'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation}/>
          <Text style={styles.testtext}>{"profile screen"}</Text>
        </View>
      </SafeAreaView>
    )
  }
}