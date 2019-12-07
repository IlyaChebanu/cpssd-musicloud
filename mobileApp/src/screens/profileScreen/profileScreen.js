import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import ProfileComponent from "../../components/profileComponent/profileComponent";
import ProfileSongs from "../../components/profileSongs/profileSongs";
import ProfilePosts from "../../components/profilePosts/profilePosts";
import FollowingComponent from "../../components/followingComponent/followingComponent";
import FollowerComponent from "../../components/followerComponent/followerComponent";
import { getLikedSongs } from "../../api/audioAPI";

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 1,
      activeFollowTab: 1,
      profileScreen: 1,
      likedSongsData: [],
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

  componentDidMount() {
    this.getLikedSongs()
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
          <ProfileSongs 
            handleFollowersClick={this.handleFollowersTextClick.bind(this)} 
            handleFollowingsClick={this.handleFollowingTextClick.bind(this)} 
            handleLikedSongsClick={this.handleLikedSongTextClick.bind(this)} 
            accessToken={this.props.token} 
            username={this.props.username} 
            navigation={this.props.navigation} />
          : <ProfilePosts 
            handleFollowersClick={this.handleFollowersTextClick.bind(this)} 
            handleFollowingsClick={this.handleFollowingTextClick.bind(this)} 
            handleLikedSongsClick={this.handleLikedSongTextClick.bind(this)} 
            accessToken={this.props.token} 
            username={this.props.username} />
        }
      </View>
    )
  }

  handleLikedSongClick() {

  }

  getLikedSongs() {
    getLikedSongs(this.props.token, this.props.username).then(response => {
      if (response.status === 200) {
        this.setState({ likedSongsData: response.data.songs })
      }
    })
  }

  renderLikedSong({ item, index }) {
    let songName = item.title
    let authorName = item.username
    let songImage = item.cover
    let playImage = require('../../assets/images/play.png')
    let songLikes = item.likes
    let likeImg = require('../../assets/images/like.png')
    return(
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleLikedSongClick(item, index)}>
        <Image style={styles.songImage} source={{uri: songImage}} />
        <Image style={styles.playImage} source={playImage} />
        <View style={styles.songDetailsContainer}>
          <Text style={styles.songNameText}>{songName}</Text>
          <Text style={styles.authorNameText}>{authorName}</Text>
          <View style={styles.likeContainer}>
            <Text style={styles.likes}>{songLikes}</Text><Image style={styles.likeImg} source={likeImg} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderLikedSongHeader() {
    return(
      <View style={styles.headerContainer}>
        <Text style={styles.likedSongTitleText}>{'Liked Songs'}</Text>
      </View>
    )
  }

  renderLikedSongs() {
    return(
      <View style={styles.likedSongsContainer}>
        <FlatList
          ListHeaderComponent={this.renderLikedSongHeader()}
          style={styles.songFlatList}
          data={this.state.likedSongsData}
          renderItem={this.renderLikedSong.bind(this)}
          keyExtractor={item => String(item.sid)}
          extraData={this.state.likedSongsData}
        />
      </View>
    )
  }

  handleFollowersTextClick() {
    this.setState({ profileScreen: 2, activeFollowTab: 1 })
  }

  handleFollowingTextClick() {
    this.setState({ profileScreen: 2, activeFollowTab: 2 })
  }

  handleLikedSongTextClick() {
    this.setState({ profileScreen: 3 })
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
    let withArrow = (this.state.profileScreen === 2 || this.state.profileScreen === 3)
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} withArrow={withArrow ? true : false} onArrowClick={this.onArrowClick.bind(this)} />
          {this.state.profileScreen === 1 && this.renderProfile()}
          {this.state.profileScreen === 2 && this.renderFollow()}
          {this.state.profileScreen === 3 && this.renderLikedSongs()}
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