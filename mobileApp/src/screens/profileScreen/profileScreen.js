import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import ProfileComponent from "../../components/profileComponent/profileComponent";

export default class ProfileScreen extends React.Component {

  render() {
    return (
      <SafeAreaView forceInset={{ bottom: 'never'}} style={{'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation}/>
          <View style={styles.container}>
            <Text style={styles.titleText}>{"PROFILE"}</Text>
            <ProfileComponent />
          </View>
        </View>
      </SafeAreaView>
    )
  }
}