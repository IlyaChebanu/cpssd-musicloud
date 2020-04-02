import React from "react";
import { StyleSheet, Text, View, Image, FlatList, TextInput, RefreshControl } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import UserProfileComponent from "../profileComponent/userProfileComponent";
import CreatePostComponent from "../createPostComponent/createPostComponent";
import { getUserPosts } from "../../api/usersAPI";

var moment = require('moment');

export default class UserProfilePosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      nextPage: null,
      refreshing: false,
    };
  }

  componentDidMount() {
    this.getPosts()
  }

  getPosts() {
    getUserPosts(this.props.username, this.props.accessToken, '', 10).then(response => {
      if (response.status === 200) {
        this.setState({
          posts: response.data.posts,
          nextPage: response.data.next_page
        })
      }
    })
  }

  onRefresh = async () => {
    this.setState({ refreshing: true });
    await this.getPosts();
    this.setState({ refreshing: false });
  }

  setTextInput(text) {
    this.setState({ inputText: text });
  }

  createdPost() {
    this.getPosts()
  }

  handleFollowerClick() {
    this.props.handleFollowersClick()
  }

  handleFollowingClick() {
    this.props.handleFollowingsClick()
  }

  handleLikedSongClick() {
    this.props.handleLikedSongsClick()
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.profileTitleText}>{"PROFILE"}</Text>
        <UserProfileComponent
          handleFollowerClick={this.handleFollowerClick.bind(this)}
          handleFollowingClick={this.handleFollowingClick.bind(this)}
          handleLikedSongClick={this.handleLikedSongClick.bind(this)}
          accessToken={this.props.accessToken}
          username={this.props.username} />
        <Text style={styles.titleText}>{"Posts"}</Text>
        {/* <CreatePostComponent createdPost={this.createdPost.bind(this)} accessToken={this.props.accessToken}/> */}
      </View>
    )
  }

  renderPost({ item, index }) {
    let profilePicUrl = item.profiler
    let profilePic = require('../../assets/images/profilePlaceholder.png')
    let username = this.props.username
    let postText = item[0]
    let postTimeAgo = moment(item[1]).fromNow()
    return (
      <View style={styles.postContainer}>
        <Text style={styles.postText}>{postText}</Text>
        <Text style={styles.timeAgo}>{postTimeAgo}</Text>
        <View style={styles.userContainer}>
          {profilePicUrl ? <Image style={styles.profilePic} source={{ uri: profilePicUrl }} /> :
            <Image style={styles.profilePic} source={profilePic} />}
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
    );
  }

  _handleLoadMore() {
    if (this.state.nextPage !== null) {
      getUserPosts(this.props.username, this.props.accessToken, this.state.nextPage, 10).then(response => {
        if (response.status === 200) {
          var joined = this.state.posts.concat(response.data.posts)
          this.setState({
            posts: joined,
            nextPage: response.data.next_page
          })
        }
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={this.renderheader()}
          style={styles.postFlatList}
          data={this.state.posts}
          renderItem={this.renderPost.bind(this)}
          keyExtractor={item => String(item)}
          extraData={this.state.posts}
          onEndReached={this._handleLoadMore.bind(this)}
          onEndReachedThreshold={0.5}
          refreshControl={(
            <RefreshControl
              tintColor={'white'}
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />)}
        />
      </View>
    )
  }
}