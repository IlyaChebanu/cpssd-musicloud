import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import ProfileComponent from "../profileComponent/profileComponent";
import { getCompiledSongs } from "../../api/audioAPI";

class ProfileSongs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songsData: [],
    };
  }

  componentDidMount() {
    this.getSongs()
  }

  getSongs() {
    getCompiledSongs(this.props.accessToken, this.props.username, 10).then(response => {
      if (response.status === 200) {
        this.setState({ songsData: response.data.compiled_songs})
      } else {
        
      }
    })
  }

  handleSongClick(item, index) {
    this.props.setSongData(item)
    this.props.setSongId(item[0])
    this.props.setSongUrl(item[6])
    this.props.navigateToMusicPlayerScreen()
    // this.props.navigation.navigate('Player')
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.profileTitleText}>{"PROFILE"}</Text>
        <ProfileComponent accessToken={this.props.accessToken} username={this.props.username} />
        <Text style={styles.titleText}>{"Songs"}</Text>
        {this.state.songsData.length === 0 ? <Text style={styles.noSongsText}>{'User has no songs yet'}</Text> : null}
      </View>
    )
  }

  renderSong({ item, index }) {
    let songName = item[2]
    let authorName = item[1]
    let songImage = item[7]
    let playImage = require('../../assets/images/play.png')
    return (
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleSongClick(item, index)}>
        <Image style={styles.songImage} source={{uri: songImage}} />
        <Image style={styles.playImage} source={playImage} />
        <View style={styles.songDetailsContainer}>
          <Text style={styles.songNameText}>{songName}</Text>
          <Text style={styles.authorNameText}>{authorName}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={this.renderheader()}
          style={styles.songFlatList}
          data={this.state.songsData}
          renderItem={this.renderSong.bind(this)}
          keyExtractor={item => String(item)}
          extraData={this.state.songsData}
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    username: state.home.username,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSongs);