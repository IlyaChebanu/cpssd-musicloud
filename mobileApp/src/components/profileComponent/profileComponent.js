import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { getUserInfo } from "../../api/usersAPI";
export default class ProfileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
    };
  }

  componentDidMount() {
    this.getUserDetails()
  }

  getUserDetails() {
    getUserInfo(this.props.username, this.props.accessToken).then(response => {
      if (isNaN(response)) {
        this.setState({
          userDetails: response
        })
      }
    })
  }

  render() {
    let profilePic = require('../../assets/images/profilePic.png')
    let userData = this.state.userDetails
    return (
      <View style={styles.container}>
        <Image source={profilePic} />
        <View style={styles.statsContainer}>
          <Text style={styles.profileText}>
            <Text style={styles.profileNum}>{userData.followers}</Text>{' followers'}{'\n'}
            <Text style={styles.profileNum}>{userData.following}</Text>{' following'}{'\n'}
            <Text style={styles.profileNum}>{userData.songs}</Text>{' songs'}{'\n'}
            <Text style={styles.profileNum}>{userData.posts}</Text>{' posts'}{'\n'}
            <Text style={styles.profileNum}>{userData.likes}</Text>{' likes'}
          </Text>
        </View>
      </View>
    )
  }
}