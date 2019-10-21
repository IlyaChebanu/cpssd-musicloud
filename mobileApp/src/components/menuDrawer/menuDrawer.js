import React from "react"
import { StyleSheet, Text, View, Image, Dimensions, Platform, TouchableOpacity } from "react-native"
import styles from "./styles";
import { SafeAreaView } from "react-navigation";

export default class MenuDrawer extends React.Component {

  handleNavigation(nav) {
        this.props.navigation.navigate(nav)
        this.props.navigation.closeDrawer()

  }
  navLink(nav, text) {
      return (
          <TouchableOpacity style={styles.linkButton} onPress={() => this.handleNavigation(nav)}>
              <View style={styles.borderLeft}></View><Text style={styles.linkText}>{text}</Text>
          </TouchableOpacity>
      )
  }

  render() {
    return (
      <SafeAreaView style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
            <View style={styles.linkContainer}>
                {this.navLink('Home', 'Discover')}
                {this.navLink('Profile', 'Profile')}
            </View>
        </View>
      </SafeAreaView>
    )
  }
}