import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import SearchComponent from "../../components/searchComponent/searchComponent";
import { getCompiledSongs } from "../../api/audioAPI";
import { getUserInfo } from "../../api/usersAPI";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songsData: [],
    };
  }

  componentDidMount() {
    this.getSongs()
  }

  getOtherUserDetails(username) {
    getUserInfo(username, this.props.token).then(response => {
      if (response.status === 200) {
        this.props.setOtherUserData(response.data)
      }
    })
  }

  handleSongClick(item, index) {
    this.props.setSongData(item)
    this.props.setSongId(item.sid)
    this.props.setSongUrl(item.url)
    this.getOtherUserDetails(item.username)
    this.props.navigateToMusicPlayerScreen()
  }

  getSongs() {
    getCompiledSongs(this.props.token, '').then(response => {
      if (response.status === 200) {
        this.setState({ songsData: response.data.songs })
      } else {

      }
    })
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>{"DISCOVER"}</Text>
        <SearchComponent />
      </View>
    )
  }

  renderSong({ item, index }) {
    let songName = item.title
    let authorName = item.username
    let songImage = item.cover
    let likedSong = item.like_status
    let playImage = require('../../assets/images/play.png')
    let songLikes = item.likes
    let likeImg = require('../../assets/images/like.png')
    let likedImg = require('../../assets/images/like_color.png')
    let placeholderImg = require('../../assets/images/cloud.png')
    return (
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleSongClick(item, index)}>
        {songImage ? <Image style={styles.songImage} source={{ uri: songImage }} /> : <Image style={styles.songImage} source={placeholderImg} />}
        <Image style={styles.playImage} source={playImage} />
        <View style={styles.songDetailsContainer}>
          <Text style={styles.songNameText}>{songName}</Text>
          <Text style={styles.authorNameText}>{authorName}</Text>
          {likedSong ?
            <View style={styles.likeContainer}>
              <Text style={styles.likedText}>{songLikes}</Text><Image style={styles.likeImg} source={likedImg} />
            </View> :
            <View style={styles.likeContainer}>
              <Text style={styles.likes}>{songLikes}</Text><Image style={styles.likeImg} source={likeImg} />
            </View>}
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} />
          <FlatList
            ListHeaderComponent={this.renderheader()}
            style={styles.discoverFlatList}
            data={this.state.songsData}
            renderItem={this.renderSong.bind(this)}
            keyExtractor={item => String(item.sid)}
            extraData={this.state.songsData}
          />
        </View>


      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);