import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { getUserInfo, patchUserPictureUrl } from "../../api/usersAPI";
import PhotoUpload from 'react-native-photo-upload';
import { postFile, putUploadFile } from "../../api/uploadApi";
import CustomAlertComponent from "../alertComponent/customAlert";

class ProfileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
      urlKey: '',
      showAlert: false,
      alertTitle: '',
      alertMessage: '',
    };
  }

  componentDidMount() {
    this.getUserDetails()
  }

  getUserDetails() {
    getUserInfo(this.props.username, this.props.accessToken).then(response => {
      if (response.status === 200) {
        this.setState({
          userDetails: response.data
        })
        this.props.setUserData(response.data)
        this.props.setPicUrl(response.data.profile_pic_url)
      }
    })
  }

  async uploadPhoto(file, filetype) {
    let randomString = Math.random().toString(36).substr(2, 7)
    if (filetype = 'image/png') {
      randomString = randomString + '.png'
    } else if (filetype = 'image/jpeg') {
      randomString = randomString + '.jpg'
    }
    await postFile(this.props.accessToken, 'profiler', randomString, filetype).then(response => {
      if (isNaN(response)) {
        if (response.signed_url.fields.key) {
          this.setState({ urlKey: response.signed_url.fields.key })
          let urlKey = response.signed_url.fields.key
          let signedUrl = response.signed_url.url
          let picUrl = signedUrl + urlKey
          putUploadFile(urlKey, file, 'image/png').then(response => {
            if (response === 200) {
              this.props.setPicUrl(picUrl)
              patchUserPictureUrl(this.props.accessToken, picUrl).then(response => {
                if (response.status === 200) {
                  this.setState({alertTitle: 'Sucess', alertMessage: 'Photo uploaded sucessfully', showAlert: true })
                } else {
                  this.setState({alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'patchUserPicture failed', showAlert: true })
                }
              })
            } else {
              this.setState({alertTitle: 'Error', alertMessage: 'Failed to upload', showAlert: true })
            }
          })
        }
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

  onPressAlertPositiveButton = () => {
    this.setState({ showAlert: false })
  };

  render() {
    let profilePic = require('../../assets/images/profilePlaceholder.png')
    let profilePicUrl = this.props.picUrl
    let userData = this.props.userData
    return (
      <View style={styles.container}>
        <CustomAlertComponent
          displayAlert={this.state.showAlert}
          alertTitleText={this.state.alertTitle}
          alertMessageText={this.state.alertMessage}
          displayPositiveButton={true}
          positiveButtonText={'OK'}
          onPressPositiveButton={this.onPressAlertPositiveButton}
        />

        <PhotoUpload
          // avatar is Image base64 string
          onPhotoSelect={avatar => {
            if (avatar) {
              let filetype
              if (avatar[0] == '/') {
                filetype = 'image/jpeg'
              } else if (avatar[0] == 'i') {
                filetype = 'image/png'
              } else {
                filetype = 'unknown'
              }
              this.uploadPhoto(avatar, filetype)
            }
          }}
        >
          {profilePicUrl ? <Image style={styles.profilePic} source={{ uri: profilePicUrl }} /> :
            <Image style={styles.profilePic} source={profilePic} />}
        </PhotoUpload>

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
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    picUrl: state.user.picUrl,
    userData: state.user.userData,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileComponent);