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
import { getCompiledSongs, postLikeSong, postUnlikeSong, getSearchSongs } from "../../api/audioAPI";
import { getUserInfo } from "../../api/usersAPI";
import CustomAlertComponent from "../../components/alertComponent/customAlert";
import SongComponent from "../../components/songComponent/songComponent";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songsData: [],
      showAlert: false,
      showLikeAlert: false,
      alertTitle: 'Confirm exit',
      alertMessage: 'Do you want to quit the app?',
      alertLikeTitle: 'Error',
      alertLikeMessage: '',
      nextPage: null,
      refreshing: false,
      searchTerm: '',
      sortBy: '',
      sortOrder: '',
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
        if (response.status===200) {
          let array = Object.assign({}, this.state.songsData);
          array[index].like_status = 1
          array[index].likes++
          this.setState({ array });
        } else {
          this.setState({ showLikeAlert: true, alertLikeMessage: response.data.message})
        }
      })
    } else {
      postUnlikeSong(this.props.token, item.sid).then(response => {
        if (response.status===200) {
          let array = Object.assign({}, this.state.songsData);
          array[index].like_status = 0
          array[index].likes--
          this.setState({ array });
        } else {
          this.setState({ showLikeAlert: true, alertLikeMessage: response.data.message})
        }
      })
    }
  }

  getSongs() {
    getSearchSongs(this.props.token, this.props.searchTerm, this.props.sortingType, this.props.sortingOrder, 10, '').then(response => {
      if (response.status === 200) {
        this.setState({ songsData: response.data.songs, nextPage: response.data.next_page })
      }
    })
  }

  searchSongs(searchTerm, sortType, sort, nextPage) {
    getSearchSongs(this.props.token, searchTerm, sortType, sort, 10, nextPage).then(response => {
      if (response.status === 200) {
        this.setState({ songsData: response.data.songs, nextPage: response.data.next_page })
      }
    })
  }

  onRefresh = async () => {
    this.setState({ refreshing: true });
    await this.searchSongs(this.state.searchTerm, this.state.sortBy, this.state.sortOrder, '')
    this.setState({ refreshing: false });
  }

  handleTyping(text) {
    this.setState({ searchTerm: text })
    this.props.setSearchTerm(text)
    this.searchSongs(text, this.state.sortBy, this.state.sortOrder, '')
  }

  handleSorting(sortByNum, sortOrderNum) {
    let sortBy = ''
    let sortOrder = ''
    if (sortByNum === 1) {
      sortBy = 'publish_sort'
    } else if (sortByNum === 2) {
      sortBy = 'title_sort'
    } else if (sortByNum === 3) {
      sortBy = 'artist_sort'
    } else if (sortByNum === 4) {
      sortBy = 'duration_sort'
    }
    if (sortOrderNum === 1) {
      sortOrder = 'down'
    } else if (sortOrderNum === 2) {
      sortOrder = 'up'
    }
    this.setState({ sortBy: sortBy, sortOrder: sortOrder })
    this.props.setSortingType(sortBy)
    this.props.setSortingOrder(sortOrder)
    this.searchSongs(this.state.searchTerm, sortBy, sortOrder, '')
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>{"DISCOVER"}</Text>
        <SearchComponent handleTyping={this.handleTyping.bind(this)} handleSorting={this.handleSorting.bind(this)} />
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

  onPressLikeAlertPositiveButton = () => {
    this.setState({ showLikeAlert: false, alertLikeMessage: '' })
  }

  onPressAlertNegativeButton = () => {
    this.setState({ showAlert: false })
  };

  _handleLoadMore() {
    if (this.state.nextPage !== null) {
      getSearchSongs(this.props.token, this.state.searchTerm, this.props.sortingType, this.props.sortingOrder, 10, this.state.nextPage).then(response => {
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
        <CustomAlertComponent
          displayAlert={this.state.showLikeAlert}
          alertTitleText={this.state.alertLikeTitle}
          alertMessageText={this.state.alertLikeMessage}
          displayPositiveButton={true}
          positiveButtonText={'OK'}
          onPressPositiveButton={this.onPressLikeAlertPositiveButton}
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
    sortingOrder: state.home.sortingOrder,
    sortingType: state.home.sortingType,
    searchTerm: state.home.searchTerm,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);