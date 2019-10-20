import React from "react"
import { StyleSheet, Text, View, Image, FlatList } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import SearchComponent from "../../components/searchComponent/searchComponent";
import songsData from "./sampleData";
import { TouchableOpacity } from "react-native-gesture-handler";

export default class DummyScreen extends React.Component {

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
      <SafeAreaView forceInset={{ bottom: 'never'}} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} />
          <View style={styles.container}>
            <Text style={styles.titleText}>{"DISCOVER"}</Text>
            <SearchComponent />
            <FlatList 
              style={styles.discoverFlatList}
              data={songsData}
              renderItem={this.renderSong.bind(this)}
              keyExtractor={item => String(item.id)}
              extraData={songsData}
            />
          </View>
          {/* <Text>{JSON.stringify(this.props, null, 2)}</Text> */}

        </View>
      </SafeAreaView>
    )
  }
}