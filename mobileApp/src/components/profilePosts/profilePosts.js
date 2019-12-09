import React from "react";
import { StyleSheet, Text, View, Image, FlatList, TextInput } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import ProfileComponent from "../profileComponent/profileComponent";
import CreatePostComponent from "../createPostComponent/createPostComponent";
import { getUserPosts, getUserTimeline } from "../../api/usersAPI";

var moment = require('moment');

export default class ProfilePosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
    };
  }

  componentDidMount() {
    this.getPosts()
  }

  getPosts() {
    getUserTimeline(this.props.accessToken, true, false).then(response => {
      if (response.status === 200) {
        this.setState({ posts: response.data.timeline })
      } else {

      }
    })
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
        <ProfileComponent
          handleFollowerClick={this.handleFollowerClick.bind(this)}
          handleFollowingClick={this.handleFollowingClick.bind(this)}
          handleLikedSongClick={this.handleLikedSongClick.bind(this)}
          accessToken={this.props.accessToken}
          username={this.props.username} />
        <Text style={styles.titleText}>{"Posts"}</Text>
        <CreatePostComponent createdPost={this.createdPost.bind(this)} accessToken={this.props.accessToken} />
      </View>
    )
  }

  renderPost({ item, index }) {
    let profilePicUrl = item.profiler
    let profilePic = require('../../assets/images/profilePlaceholder.png')
    let username = item.username
    let postText = item.message //item[0]
    let postTimeAgo = moment(item.created).fromNow() //moment(item[1]).fromNow()
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

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={this.renderheader()}
          style={styles.postFlatList}
          data={this.state.posts}
          renderItem={this.renderPost.bind(this)}
          keyExtractor={item => String(item.created)}
          extraData={this.state.posts}
        />
      </View>
    )
  }
}