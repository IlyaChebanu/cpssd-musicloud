import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import UserProfileComponent from "../profileComponent/userProfileComponent";
import { getCompiledSongs, postLikeSong, postUnlikeSong } from "../../api/audioAPI";

class UserProfileSongs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songsData: [],
      nextPage: null,
      refreshing: false,
    };
  }

  componentDidMount() {
    this.getSongs()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.songUpdate !== this.props.songUpdate) {
      this.getSongs()
    }
  }

  getSongs() {
    getCompiledSongs(this.props.accessToken, this.props.username, 10, '').then(response => {
      if (response.status === 200) {
        this.setState({ songsData: response.data.songs, nextPage: response.data.next_page })
      }
    })
  }

  onRefresh = async () => {
    this.setState({ refreshing: true });
    await this.getSongs();
    this.setState({ refreshing: false });
  }

  handleSongClick(item, index) {
    this.props.setSongData(this.state.songsData)
    this.props.setSongIndex(index)
    this.props.setSongId(item.sid)
    this.props.setSongUrl(item.url)
    this.props.navigateToMusicPlayerScreen()
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

  handleLikeClick(item, index) {
    if (item.like_status === 0) {
      postLikeSong(this.props.token, item.sid).then(response => {
        let array = Object.assign({}, this.state.songsData);
        array[index].like_status = 1
        array[index].likes++
        this.setState({ array });
      })
    } else {
      postUnlikeSong(this.props.token, item.sid).then(response => {
        let array = Object.assign({}, this.state.songsData);
        array[index].like_status = 0
        array[index].likes--
        this.setState({ array });
      })
    }
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
        <Text style={styles.titleText}>{"Songs"}</Text>
        {this.state.songsData.length === 0 ? <Text style={styles.noSongsText}>{'User has no songs yet'}</Text> : null}
      </View>
    )
  }

  renderSong({ item, index }) {
    let songName = item.title
    let authorName = item.username
    let songImage = item.cover
    let playImage = require('../../assets/images/play.png')
    let songLikes = item.likes
    let likeImg = require('../../assets/images/like.png')
    let placeholderImg = require('../../assets/images/cloud.png')
    let profilePicUrl = item.profiler
    let profilePic = require('../../assets/images/profilePlaceholder.png')
    let likedSong = item.like_status
    let likedImg = require('../../assets/images/like_color.png')
    return (
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleSongClick(item, index)}>
        {songImage ? <Image style={styles.songImage} source={{ uri: songImage }} /> : <Image style={styles.songImage} source={placeholderImg} />}
        <Image style={styles.playImage} source={playImage} />
        <View style={styles.songDetailsContainer}>
          <Text style={styles.songNameText}>{songName}</Text>
          <View style={styles.userContainer}>
            {profilePicUrl ? <Image style={styles.profilePic} source={{ uri: profilePicUrl }} /> :
              <Image style={styles.profilePic} source={profilePic} />}
            <Text style={styles.authorNameText}>{authorName}</Text>
          </View>
          <TouchableOpacity style={styles.heartlike} onPress={() => this.handleLikeClick(item, index)}>
            {likedSong ? <View style={styles.likeContainer}>
              <Text style={styles.likedText}>{songLikes}</Text><Image style={styles.likeImg} source={likedImg} />
            </View> :
              <View style={styles.likeContainer}>
                <Text style={styles.likes}>{songLikes}</Text><Image style={styles.likeImg} source={likeImg} />
              </View>}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  _handleLoadMore() {
    if (this.state.nextPage !== null) {
      getCompiledSongs(this.props.accessToken, this.props.username, 10, this.state.nextPage).then(response => {
        if (response.status === 200) {
          var joined = this.state.songsData.concat(response.data.songs)
          this.setState({ songsData: joined, nextPage: response.data.next_page })
        }
      })
    }
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={this.renderheader()}
          style={styles.songFlatList}
          data={this.state.songsData}
          renderItem={this.renderSong.bind(this)}
          keyExtractor={item => String(item.sid)}
          extraData={this.state.songsData}
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

function mapStateToProps(state) {
  return {
    token: state.home.token,
    songUpdate: state.song.songUpdate,
    // username: state.home.username,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileSongs);