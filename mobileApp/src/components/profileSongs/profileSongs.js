import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native"
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
    getCompiledSongs(this.props.accessToken, 111).then(response => {
      if (isNaN(response)) {
        this.setState({ songsData: response.compiled_songs})
      } else {
        
      }
    })
  }

  handleSongClick(item, index) {
    this.props.setSongData(item)
    this.props.setSongId(item[0])
    this.props.setSongUrl(item[6])
    this.props.navigateToMusicPlayerScreen()
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.profileTitleText}>{"PROFILE"}</Text>
        <ProfileComponent />
        <Text style={styles.titleText}>{"Songs"}</Text>
      </View>
    )
  }

  renderSong({ item, index }) {
    let songName = item[2]
    let authorName = item[8]
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
        {/* <Text style={styles.titleText}>{"Songs"}</Text> */}
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
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSongs);