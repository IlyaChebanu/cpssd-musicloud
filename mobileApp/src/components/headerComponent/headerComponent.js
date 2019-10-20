import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import styles from "./styles";
import { TouchableOpacity } from "react-native-gesture-handler";

export default class HeaderComponent extends React.Component {

    render() {
        var logoImage = require("../../assets/images/logo.png");
        var menuImage = require("../../assets/images/menu.png");
        return (
            <View style={styles.headerContainer}>
                <Image style={styles.logo} source={logoImage}/>
                <TouchableOpacity style={styles.menuButton} onPress={this.props.navigation.openDrawer}>
                <Image style={styles.menu} source={menuImage}/>
                </TouchableOpacity>
            </View>
        )
    }
  }