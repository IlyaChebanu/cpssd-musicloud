import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
export default class ProfileComponent extends React.Component {

  render() {
    let profilePic = require('../../assets/images/profilePic.png')
    return (
      <View style={styles.container}>
        <Image source={profilePic} />
        <View style={styles.statsContainer}>
            <Text style={styles.profileText}><Text style={styles.profileNum}>{'300 '}</Text>{'followers'}{'\n'}
            <Text style={styles.profileNum}>{'234 '}</Text>{'following'}{'\n'}
            <Text style={styles.profileNum}>{'16 '}</Text>{'songs'}{'\n'}
            <Text style={styles.profileNum}>{'12 '}</Text>{'posts'}{'\n'}
            <Text style={styles.profileNum}>{'266 '}</Text>{'likes'}</Text>
        </View>
      </View>
    )
  }
}