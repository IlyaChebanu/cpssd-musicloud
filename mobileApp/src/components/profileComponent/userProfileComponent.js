import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Alert } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { getUserInfo, patchUserPictureUrl, followUser, unfollowUser } from "../../api/usersAPI";
import PhotoUpload from 'react-native-photo-upload';
import { postFile, putUploadFile } from "../../api/uploadApi";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";

class UserProfileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      urlKey: '',
      following: false,
    };
  }

  componentDidMount() {
    let obj = this.props.following
    this.setState({ following: obj[this.props.otherUserData.username] })
  }

  showAlert(title, text, action) {
    Alert.alert(
      title,
      text,
      [
        { text: 'OK', onPress: action },
      ],
      { cancelable: false },
    );
  }

  getOtherUserDetails(username) {
    getUserInfo(this.props.otherUserData.username, this.props.token).then(response => {
      if (response.status === 200) {
        this.props.setOtherUserData(response.data)
      }
    })
  }

  handleFollow() {
    followUser(this.props.token, this.props.otherUserData.username).then(response => {
      if (response.status === 200) {
        this.setState({ following: true })
        let obj = this.props.following
        obj[this.props.otherUserData.username] = true
        this.props.setFollowing(obj)
        this.getOtherUserDetails()
      }
    })
  }

  handleUnFollow() {
    unfollowUser(this.props.token, this.props.otherUserData.username).then(response => {
      if (response.status === 200) {
        this.setState({ following: false })
        let obj = this.props.following
        obj[this.props.otherUserData.username] = false
        this.props.setFollowing(obj)
        this.getOtherUserDetails()
      }
    })
  }

  handleFollowerClick() {
    this.props.handleFollowerClick()
  }

  handleFollowingClick() {
    this.props.handleFollowingClick()
  }

  handleLikedSongClick() {
    this.props.handleLikedSongClick()
  }

  render() {
    let profilePic = require('../../assets/images/profilePlaceholder.png')
    let profilePicUrl = this.props.otherUserData.profile_pic_url
    let userData = this.props.otherUserData
    let isMyProfile = this.props.username === this.props.otherUserData.username
    return (
      <View>
        <Text style={styles.usernameText}>{this.props.otherUserData.username}</Text>
        <View style={styles.container}>
          {profilePicUrl ? <Image style={styles.profilePic} source={{ uri: profilePicUrl }} /> :
            <Image style={styles.profilePic} source={profilePic} />}

          <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.link} onPress={() => this.handleFollowerClick()}>
              <Text style={styles.profileText}><Text style={styles.profileNum}>{userData.followers}</Text>{' followers'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.handleFollowingClick()}>
              <Text style={styles.profileText}><Text style={styles.profileNum}>{userData.following}</Text>{' following'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.handleLikedSongClick()}>
              <Text style={styles.profileText}><Text style={styles.profileNum}>{userData.likes}</Text>{' liked songs'}</Text>
            </TouchableOpacity>
            <Text style={styles.profileText}>
              <Text style={styles.profileNum}>{userData.songs}</Text>{' songs'}{'\n'}
              <Text style={styles.profileNum}>{userData.posts}</Text>{' posts'}{'\n'}
            </Text>
          </View>
        </View>
        <View style={styles.followingContainer}>
          {(this.state.following && !isMyProfile) ? <TouchableOpacity style={styles.followingButton} onPress={() => this.handleUnFollow()}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
              <Text style={styles.followText}>{'Following ✓'}</Text>
            </LinearGradient>
          </TouchableOpacity> : !isMyProfile ?
            <TouchableOpacity style={styles.followingNotButton} onPress={() => this.handleFollow()}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
                <Text style={styles.followText}>{'Follow'}</Text>
              </LinearGradient>
            </TouchableOpacity> : null}
        </View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    username: state.home.username,
    otherUserData: state.user.otherUserData,
    following: state.user.following,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileComponent);