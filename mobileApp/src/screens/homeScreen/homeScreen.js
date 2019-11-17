import React from "react"
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import SearchComponent from "../../components/searchComponent/searchComponent";
import songsData from "./sampleData";
import { getCompiledSongs } from "../../api/audioAPI";

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

  handleSongClick(item, index) {
    this.props.setSongData(item)
    this.props.setSongId(item[0])
    this.props.setSongUrl(item[6])
    this.props.navigateToMusicPlayerScreen()
  }

  getSongs() {
    getCompiledSongs(this.props.token).then(response => {
      if (isNaN(response)) {
        this.setState({ songsData: response.compiled_songs})
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
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} />
          <FlatList
            ListHeaderComponent={this.renderheader()}
            style={styles.discoverFlatList}
            data={this.state.songsData}
            renderItem={this.renderSong.bind(this)}
            keyExtractor={item => String(item)}
            extraData={this.state.songsData}
          />
        </View>
        {/* <Text>{JSON.stringify(this.props, null, 2)}</Text> */}


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