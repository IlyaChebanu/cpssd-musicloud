import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import UserProfileSongs from "../../components/profileSongs/userProfileSongs";
import UserProfilePosts from "../../components/profilePosts/userProfilePosts";

class UserProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 1,

    }
  }

  handleSongsClick() {
    this.setState({ activeTab: 1 })
  }

  handlePostsClick() {
    this.setState({ activeTab: 2 })
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowDownImg = require("../../assets/images/arrow_down.png");
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <View style={styles.headerContainer}>
            <Image style={styles.logo} source={logoImage} />
            <TouchableOpacity style={styles.arrowDown} onPress={() => this.props.navigateBack()}>
              <Image style={styles.arrowDownImg} source={arrowDownImg} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileTabs}>
            <View style={styles.profileSongTab}>
              {this.state.activeTab === 1 && <View style={styles.activeTab} />}
              <TouchableOpacity style={styles.tabClick} onPress={() => this.handleSongsClick()}>
                <Text style={styles.tabTitleText}>{'Songs'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profilePostTab}>
              {this.state.activeTab === 2 && <View style={styles.activeTab} />}
              <TouchableOpacity style={styles.tabClick} onPress={() => this.handlePostsClick()}>
                <Text style={styles.tabTitleText}>{'Posts'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.activeTab === 1 ?
            <UserProfileSongs accessToken={this.props.token} username={this.props.otherUserData.username} navigation={this.props.navigation} />
            : <UserProfilePosts accessToken={this.props.token} username={this.props.otherUserData.username} />
          }
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    username: state.home.username,
    otherUserData: state.user.otherUserData,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileScreen);