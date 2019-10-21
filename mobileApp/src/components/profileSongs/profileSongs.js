import React from "react"
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import songsData from "../../screens/homeScreen/sampleData";

export default class ProfileSongs extends React.Component {

  handleSongClick(item, index) {

  }

  renderSong({ item, index }) {
    let songName = item.name
    let authorName = item.author
    let songImage = item.image
    let playImage = require('../../assets/images/play.png')
    return (
      <TouchableOpacity style={styles.songContainer} onPress={() => this.handleSongClick(item, index)}>
        {/* <Image style={styles.songImage} source={{uri: songImage}} /> */}
        <Image style={styles.songImage} source={songImage} />
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
            <Text style={styles.titleText}>{"Songs"}</Text>
            <FlatList 
              style={styles.songFlatList}
              data={songsData}
              renderItem={this.renderSong.bind(this)}
              keyExtractor={item => String(item.id)}
              extraData={songsData}
            />
          </View>
    )
  }
}