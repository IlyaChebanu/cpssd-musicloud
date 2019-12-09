import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import styles from "./styles";

export default class HeaderComponent extends React.Component {

    handleOnArrowClick() {
        this.props.onArrowClick()
    }

    render() {
        var logoImage = require("../../assets/images/logo1.png");
        var menuImage = require("../../assets/images/menu.png");
        var arrowBack = require("../../assets/images/back_arrow.png")
        return (
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                {this.props.withArrow && 
                <TouchableOpacity onPress={() => this.handleOnArrowClick()}>
                    <Image style={styles.arrowBack} source={arrowBack} />
                </TouchableOpacity>}
                <Image style={styles.logo} source={logoImage} />
                </View>
                <TouchableOpacity style={styles.menuButton} onPress={this.props.navigation.openDrawer}>
                    <Image style={styles.menu} source={menuImage} />
                </TouchableOpacity>
            </View>
        )
    }
}