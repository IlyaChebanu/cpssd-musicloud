import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Easing, Dimensions, FlatList, BackHandler } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import UserProfileSongs from "../../components/profileSongs/userProfileSongs";
import UserProfilePosts from "../../components/profilePosts/userProfilePosts";
import { animateTimingNative, animateTimingPromiseNative } from "../../utils/animate";
import { getLikedSongs } from "../../api/audioAPI";
import UserFollowingComponent from "../../components/followingComponent/userfollowingComponent";
import UserFollowerComponent from "../../components/followerComponent/userfollowerComponent";

const { width, height } = Dimensions.get('window');

class UserProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    //animated values
    this.animatedSongsScreen = new Animated.Value(1)
    this.animatedPostsScreen = new Animated.Value(2)
    this.animatedProfileScreen = new Animated.Value(1)
    this.animatedLikedScreen = new Animated.Value(0)
    this.animatedFollowersScreen = new Animated.Value(2)
    this.animatedFollowingScreen = new Animated.Value(2)

    this.state = {
      screenState: [1],
      profileTab: 1,
      activeFollowTab: 1,
      profileScreen: 1,
      likedSongsData: [],
      nextPage: null,
    }
  }

  componentDidMount() {
    this.getLikedSongs()
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    this.onArrowClick()
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.songUpdate !== this.props.songUpdate) {
      this.getLikedSongs()
    }
  }

  getLikedSongs() {
    getLikedSongs(this.props.token, this.props.otherUserData.username, 10, this.state.nextPage).then(response => {
      if (response.status === 200) {
        var joined = this.state.likedSongsData.concat(response.data.songs)
        this.setState({ likedSongsData: joined, nextPage: response.data.next_page })
      }
    })
  }

  handleLikedSongClick(item, index) {
    this.props.setSongData(this.state.likedSongsData)
    this.props.setSongIndex(index)
    this.props.setSongId(item.sid)
    this.props.setSongUrl(item.url)
    this.props.navigateToMusicPlayerScreen()
  }

  handleSongsClick() {
    this.setState({ screenState: [...this.state.screenState, 1], profileTab: 1 })
    animateTimingPromiseNative(this.animatedSongsScreen, 1, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [1] })
        this.animatedSongsScreen.setValue(1)
        this.animatedPostsScreen.setValue(2)
      }
    )
    animateTimingNative(this.animatedPostsScreen, 2, 400, Easing.ease)
  }

  handlePostsClick() {
    this.setState({ screenState: [...this.state.screenState, 2], profileTab: 2 })
    animateTimingPromiseNative(this.animatedSongsScreen, 0, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [2] })
        this.animatedSongsScreen.setValue(0)
        this.animatedPostsScreen.setValue(1)
      }
    )
    animateTimingNative(this.animatedPostsScreen, 1, 400, Easing.ease)
  }

  handleFollowersClick() {
    this.setState({ screenState: [...this.state.screenState, 3], activeFollowTab: 1 })
    animateTimingNative(this.animatedFollowingScreen, 2, 400, Easing.ease)
    animateTimingPromiseNative(this.animatedFollowersScreen, 1, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [3] })
        this.animatedFollowersScreen.setValue(1)
        this.animatedFollowingScreen.setValue(2)
      }
    )
  }

  handleFollowingClick() {
    this.setState({ screenState: [...this.state.screenState, 4], activeFollowTab: 2 })
    animateTimingNative(this.animatedFollowingScreen, 1, 400, Easing.ease)
    animateTimingPromiseNative(this.animatedFollowersScreen, 0, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [4] })
        this.animatedFollowingScreen.setValue(1)
        this.animatedFollowersScreen.setValue(0)
      }
    )
  }

  handleFollowersTextClick() {
    this.animatedFollowersScreen.setValue(1)
    this.animatedFollowingScreen.setValue(2)
    this.setState({ screenState: [...this.state.screenState, 3], activeFollowTab: 1, profileScreen: 2 })
    animateTimingPromiseNative(this.animatedProfileScreen, 0, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [3] })
        this.animatedProfileScreen.setValue(0)
      }
    )
  }

  handleFollowingTextClick() {
    this.animatedFollowingScreen.setValue(1)
    this.animatedFollowersScreen.setValue(0)
    this.setState({ screenState: [...this.state.screenState, 4], activeFollowTab: 2, profileScreen: 2 })
    animateTimingPromiseNative(this.animatedProfileScreen, 0, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [4] })
        this.animatedProfileScreen.setValue(0)
      }
    )
  }

  handleLikedSongTextClick() {
    this.setState({ screenState: [...this.state.screenState, 5], profileScreen: 3 })
    animateTimingNative(this.animatedLikedScreen, 1, 400, Easing.ease)
    animateTimingPromiseNative(this.animatedProfileScreen, 0, 400, Easing.ease).then(
      () => {
        this.setState({ screenState: [5] })
        this.animatedProfileScreen.setValue(0)
        this.animatedLikedScreen.setValue(1)
      }
    )
  }

  renderFollow() {
    let following = this.props.otherUserData.following ? this.props.otherUserData.following : 0;
    let followers = this.props.otherUserData.followers ? this.props.otherUserData.followers : 0;
    // animate
    const followerPosition = this.animatedFollowersScreen.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [-width, 0, width]
    })
    const followingPosition = this.animatedFollowingScreen.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [-width, 0, width]
    })
    const profilePosition = this.animatedProfileScreen.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width]
    })
    return (
      <Animated.View style={[styles.followContainer, { transform: [{ translateX: profilePosition }] }]}>
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
        {this.state.screenState.includes(3) &&
          <Animated.View style={[{ 'flex': 1, position: 'absolute', top: 50, 'width': width, 'height': height - 175 }, { transform: [{ translateX: followerPosition }] }]}>
            <UserFollowerComponent accessToken={this.props.token} username={this.props.otherUserData.username} />
          </Animated.View>
        }
        {this.state.screenState.includes(4) &&
          <Animated.View style={[{ 'flex': 1, position: 'absolute', top: 50, 'width': width, 'height': height - 175 }, { transform: [{ translateX: followingPosition }] }]}>
            <UserFollowingComponent accessToken={this.props.token} username={this.props.otherUserData.username} />
          </Animated.View>
        }
      </Animated.View>
    )
  }

  renderProfile() {
    var logoImage = require("../../assets/images/logo1.png");
    var arrowDownImg = require("../../assets/images/arrow_down.png");
    // animate
    const songsPosition = this.animatedSongsScreen.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, 0]
    })
    const postsPosition = this.animatedPostsScreen.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [-width, 0, width]
    })
    const profilePosition = this.animatedProfileScreen.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, 0]
    })
    return (
      <Animated.View style={[styles.profileContainer, { transform: [{ translateX: profilePosition }] }]}>
        <View style={styles.profileTabs}>
          <View style={styles.profileSongTab}>
            {this.state.profileTab === 1 && <View style={styles.activeTab} />}
            <TouchableOpacity style={styles.tabClick} onPress={() => this.handleSongsClick()}>
              <Text style={styles.tabTitleText}>{'Songs'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profilePostTab}>
            {this.state.profileTab === 2 && <View style={styles.activeTab} />}
            <TouchableOpacity style={styles.tabClick} onPress={() => this.handlePostsClick()}>
              <Text style={styles.tabTitleText}>{'Posts'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {this.state.screenState.includes(1) &&
          <Animated.View style={[{ 'flex': 1, position: 'absolute', top: 50, 'height': height - 175 }, { transform: [{ translateX: songsPosition }] }]}>
            <UserProfileSongs
              handleFollowersClick={this.handleFollowersTextClick.bind(this)}
              handleFollowingsClick={this.handleFollowingTextClick.bind(this)}
              handleLikedSongsClick={this.handleLikedSongTextClick.bind(this)}
              accessToken={this.props.token}
              username={this.props.otherUserData.username}
              navigation={this.props.navigation}
            />
          </Animated.View>}
        {this.state.screenState.includes(2) &&
          <Animated.View style={[{ 'flex': 1, position: 'absolute', top: 50, 'width': width, 'height': height - 175 }, { transform: [{ translateX: postsPosition }] }]}>
            <UserProfilePosts
              handleFollowersClick={this.handleFollowersTextClick.bind(this)}
              handleFollowingsClick={this.handleFollowingTextClick.bind(this)}
              handleLikedSongsClick={this.handleLikedSongTextClick.bind(this)}
              accessToken={this.props.token}
              username={this.props.otherUserData.username} />
          </Animated.View>
        }
      </Animated.View>
    )
  }

  renderLikedSongHeader() {
    return (
      <View style={styles.likeHeaderContainer}>
        <Text style={styles.likedSongTitleText}>{'Liked Songs'}</Text>
      </View>
    )
  }

  renderLikedSong({ item, index }) {
    let songName = item.title
    let authorName = item.username
    let songImage = item.cover
    let playImage = require('../../assets/images/play.png')
    let songLikes = item.likes
    let likeImg = require('../../assets/images/like.png')
    let likedSong = item.like_status
    let likedImg = require('../../assets/images/like_color.png')
    let placeholderImg = require('../../assets/images/cloud.png')
    return (
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleLikedSongClick(item, index)}>
        {songImage ? <Image style={styles.songImage} source={{ uri: songImage }} /> : <Image style={styles.songImage} source={placeholderImg} />}
        <Image style={styles.playImage} source={playImage} />
        <View style={styles.songDetailsContainer}>
          <Text style={styles.songNameText}>{songName}</Text>
          <Text style={styles.authorNameText}>{authorName}</Text>
          {likedSong ? <View style={styles.likeContainer}>
            <Text style={styles.likedText}>{songLikes}</Text><Image style={styles.likeImg} source={likedImg} />
          </View> :
            <View style={styles.likeContainer}>
              <Text style={styles.likes}>{songLikes}</Text><Image style={styles.likeImg} source={likeImg} />
            </View>}
        </View>
      </TouchableOpacity>
    )
  }

  _handleLoadMore() {
    if (this.state.nextPage !== null){
      this.getLikedSongs()
    }
  }

  renderLikedSongs() {
    const profilePosition = this.animatedLikedScreen.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0]
    })
    return (
      <Animated.View style={[styles.likedSongsContainer, { transform: [{ translateX: profilePosition }] }]}>
        <FlatList
          ListHeaderComponent={this.renderLikedSongHeader()}
          style={styles.songFlatList}
          data={this.state.likedSongsData}
          renderItem={this.renderLikedSong.bind(this)}
          keyExtractor={item => String(item.sid)}
          extraData={this.state.likedSongsData}
          onEndReached={this._handleLoadMore.bind(this)}
          onEndReachedThreshold={0.5}
        />
      </Animated.View>
    )
  }

  onArrowClick() {
    let screen = this.state.screenState
    if (screen.includes(5)) {
      this.setState({ screenState: [...this.state.screenState, this.state.profileTab], profileScreen: 1 })
      animateTimingNative(this.animatedLikedScreen, 0, 400, Easing.ease)
      animateTimingPromiseNative(this.animatedProfileScreen, 1, 400, Easing.ease).then(
        () => {
          this.setState({ screenState: [this.state.profileTab] })
          this.animatedProfileScreen.setValue(1)
          this.animatedLikedScreen.setValue(0)
        }
      )
    } else if (screen.some(r => [1, 2].indexOf(r) >= 0)) {
      this.props.navigateBack()
    } else {
      this.setState({ screenState: [...this.state.screenState, this.state.profileTab], profileScreen: 1 })
      animateTimingPromiseNative(this.animatedProfileScreen, 1, 400, Easing.ease).then(
        () => {
          this.setState({ screenState: [this.state.profileTab] })
          this.animatedProfileScreen.setValue(1)
        }
      )
    }
  }

  render() {
    var logoImage = require("../../assets/images/logo1.png");
    var arrowDownImg = require("../../assets/images/arrow_down.png");
    let withArrow = (this.state.profileScreen === 2 || this.state.profileScreen === 3)
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <View style={styles.headerContainer}>
            <Image style={styles.logo} source={logoImage} />
            <TouchableOpacity style={styles.arrowDown} onPress={() => this.onArrowClick()}>
              <Image style={styles.arrowDownImg} source={arrowDownImg} />
            </TouchableOpacity>
          </View>
          {this.state.screenState.some(r => [1, 2].indexOf(r) >= 0) && this.renderProfile()}
          {this.state.screenState.some(r => [3, 4].indexOf(r) >= 0) && this.renderFollow()}
          {this.state.screenState.some(r => [5].indexOf(r) >= 0) && this.renderLikedSongs()}
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
    songUpdate: state.song.songUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileScreen);