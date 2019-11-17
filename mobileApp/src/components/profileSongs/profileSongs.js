import React from "react"
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import ProfileComponent from "../profileComponent/profileComponent";
import { getCompiledSongs } from "../../api/audioAPI";

export default class ProfileSongs extends React.Component {
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