import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import ProfileComponent from "../../components/profileComponent/profileComponent";
import ProfileSongs from "../../components/profileSongs/profileSongs";
import ProfilePosts from "../../components/profilePosts/profilePosts";
import FollowingComponent from "../../components/followingComponent/followingComponent";
import FollowerComponent from "../../components/followerComponent/followerComponent";

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 1,
      activeFollowTab: 1,
      profileScreen: 1,
    }
  }

  handleSongsClick() {
    this.setState({ activeTab: 1 })
  }

  handlePostsClick() {
    this.setState({ activeTab: 2 })
  }

  handleFollowersClick() {
    this.setState({ activeFollowTab: 1 })
  }

  handleFollowingClick() {
    this.setState({ activeFollowTab: 2 })
  }

  renderProfile() {
    return (
      <View style={styles.profileContainer}>
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
          <ProfileSongs handleFollowersClick={this.handleFollowersTextClick.bind(this)} handleFollowingsClick={this.handleFollowingTextClick.bind(this)} accessToken={this.props.token} username={this.props.username} navigation={this.props.navigation} />
          : <ProfilePosts handleFollowersClick={this.handleFollowersTextClick.bind(this)} handleFollowingsClick={this.handleFollowingTextClick.bind(this)} accessToken={this.props.token} username={this.props.username} />
        }
      </View>
    )
  }

  handleFollowersTextClick() {
    this.setState({ profileScreen: 2, activeFollowTab: 1 })
  }

  handleFollowingTextClick() {
    this.setState({ profileScreen: 2, activeFollowTab: 2 })
  }

  renderFollow() {
    let following = this.props.userData.following ? this.props.userData.following : 0;
    let followers = this.props.userData.followers ? this.props.userData.followers : 0;
    return (
      <View style={styles.followContainer}>
        <View style={styles.followTabs}>
          <View style={styles.followersTab}>
            {this.state.activeFollowTab === 1 && <View style={styles.activeTab} />}
            <TouchableOpacity style={styles.tabClick} onPress={() => this.handleFollowersClick()}>
              <Text style={styles.tabTitleText}>{followers + ' Followers'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.followingTab}>
            {this.state.activeFollowTab === 2 && <View style={styles.activeTab} />}
            <TouchableOpacity style={styles.tabClick} onPress={() => this.handleFollowingClick()}>
              <Text style={styles.tabTitleText}>{following + ' Following'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {this.state.activeFollowTab === 1 ?
          <FollowerComponent accessToken={this.props.token} username={this.props.username} />
          : <FollowingComponent accessToken={this.props.token} username={this.props.username} />
        }
      </View>
    )
  }

  onArrowClick() {
    this.setState({ profileScreen: 1 })
  }

  render() {
    let followScreen = this.state.profileScreen === 2
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} withArrow={followScreen ? true : false} onArrowClick={this.onArrowClick.bind(this)} />
          {this.state.profileScreen === 1 ? this.renderProfile() : this.renderFollow()}
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    username: state.home.username,
    userData: state.user.userData,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);