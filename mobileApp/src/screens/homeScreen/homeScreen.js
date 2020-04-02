import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, BackHandler, RefreshControl } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import SearchComponent from "../../components/searchComponent/searchComponent";
import { getCompiledSongs, postLikeSong, postUnlikeSong } from "../../api/audioAPI";
import { getUserInfo } from "../../api/usersAPI";
import CustomAlertComponent from "../../components/alertComponent/customAlert";
import SongComponent from "../../components/songComponent/songComponent";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songsData: [],
      showAlert: false,
      alertTitle: 'Confirm exit',
      alertMessage: 'Do you want to quit the app?',
      nextPage: null,
      refreshing: false,
    };
  }

  componentDidMount() {
    this.getSongs()
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    this.setState({ showAlert: true })
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.songUpdate !== this.props.songUpdate) {
      this.getSongs()
    }
  }

  getOtherUserDetails(username) {
    getUserInfo(username, this.props.token).then(response => {
      if (response.status === 200) {
        this.props.setOtherUserData(response.data)
      }
    })
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

  getSongs() {
    getCompiledSongs(this.props.token, '', 10, '').then(response => {
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

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>{"DISCOVER"}</Text>
        <SearchComponent />
      </View>
    )
  }

  handleSongClick(item, index) {
    this.props.setSongData(this.state.songsData)
    this.props.setSongId(item.sid)
    this.props.setSongIndex(index)
    this.props.setSongUrl(item.url)
    this.getOtherUserDetails(item.username)
    this.props.navigateToMusicPlayerScreen()
  }

  renderSong({ item, index }) {
    return (
      <SongComponent item={item} index={index} handleSongClicked={this.handleSongClick.bind(this)} handleLikeClicked={this.handleLikeClick.bind(this)} />
    );
  }

  onPressAlertPositiveButton = () => {
    BackHandler.exitApp()
    this.setState({ showAlert: false })
  };

  onPressAlertNegativeButton = () => {
    this.setState({ showAlert: false })
  };

  _handleLoadMore() {
    if (this.state.nextPage !== null) {
      getCompiledSongs(this.props.token, '', 10, this.state.nextPage).then(response => {
        if (response.status === 200) {
          var joined = this.state.songsData.concat(response.data.songs)
          this.setState({ songsData: joined, nextPage: response.data.next_page })
        }
      })
    }
  }

  render() {
    return (
      <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <CustomAlertComponent
          displayAlert={this.state.showAlert}
          alertTitleText={this.state.alertTitle}
          alertMessageText={this.state.alertMessage}
          displayPositiveButton={true}
          positiveButtonText={'OK'}
          displayNegativeButton={true}
          negativeButtonText={'CANCEL'}
          onPressPositiveButton={this.onPressAlertPositiveButton}
          onPressNegativeButton={this.onPressAlertNegativeButton}
        />
        <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation} />
          <FlatList
            ListHeaderComponent={this.renderheader()}
            style={styles.discoverFlatList}
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


      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    songUpdate: state.song.songUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);