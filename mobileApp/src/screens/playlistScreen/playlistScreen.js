import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, BackHandler, RefreshControl } from "react-native";
import styles from "./styles";
import { SafeAreaView } from "react-navigation";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { getPlaylist, getPlaylistSongs, postLikeSong, postUnlikeSong } from "../../api/audioAPI";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserInfo } from "../../api/usersAPI";
import CustomAlertComponent from "../../components/alertComponent/customAlert";

class PlaylistScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playlistData: [],
            playlistSongData: [],
            screenState: 1,
            playlistTitle: '',
            pid: null,
            showExitAlert: false,
            nextPage: null,
            nextPagePlaylist: null,
            refreshing: false,
            showLikeAlert: false,
            alertLikeTitle: 'Error',
            alertLikeMessage: '',
        };
    }

    componentDidMount() {
        this.getPlaylist()
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    handleAndroidBackPress = () => {
        if (this.state.screenState === 2) {
            this.goBack()
            return true;
        } else {
            this.setState({ showExitAlert: true })
            return true
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.songUpdate !== this.props.songUpdate) {
            this.getPlaylistSongs(this.state.pid)
        }
    }

    getPlaylistSongs(pid) {
        getPlaylistSongs(this.props.token, pid, 10, '').then(response => {
            if (response.status === 200) {
                this.setState({ playlistSongData: response.data.songs, nextPage: response.data.next_page, screenState: 2 })
            }
        })
    }

    onRefresh = async () => {
        this.setState({ refreshing: true });
        await this.getPlaylistSongs(this.state.pid);
        this.setState({ refreshing: false });
    }

    onRefreshPlaylist = async () => {
        this.setState({ refreshing: true });
        await this.getPlaylist();
        this.setState({ refreshing: false });
    }

    getPlaylist() {
        getPlaylist(this.props.token, 30, '').then(response => {
            if (response.status === 200) {
                this.setState({ playlistData: response.data.playlists, nextPagePlaylist: response.data.next_page })
            }
        })
    }

    handlePlaylistClick(item) {
        this.setState({ playlistTitle: item.title, pid: item.pid })
        this.getPlaylistSongs(item.pid)
    }

    goBack() {
        this.setState({ screenState: 1, playlistSongData: [] })
    }

    getOtherUserDetails(username) {
        getUserInfo(username, this.props.token).then(response => {
            if (response.status === 200) {
                this.props.setOtherUserData(response.data)
            }
        })
    }

    handleSongClick(item, index) {
        this.props.setSongData(this.state.playlistSongData)
        this.props.setSongIndex(index)
        this.props.setSongId(item.sid)
        this.props.setSongUrl(item.url)
        this.getOtherUserDetails(item.username)
        this.props.navigateToMusicPlayerScreen()
    }

    handleLikeClick(item, index) {
        if (item.like_status === 0) {
            postLikeSong(this.props.token, item.sid).then(response => {
                if (response.status === 200) {
                    let array = Object.assign({}, this.state.playlistSongData);
                    array[index].like_status = 1
                    array[index].likes++
                    this.setState({ array });
                } else {
                    this.setState({ showLikeAlert: true, alertLikeMessage: response.data.message })
                }
            })
        } else {
            postUnlikeSong(this.props.token, item.sid).then(response => {
                if (response.status === 200) {
                    let array = Object.assign({}, this.state.playlistSongData);
                    array[index].like_status = 0
                    array[index].likes--
                    this.setState({ array });
                } else {
                    this.setState({ showLikeAlert: true, alertLikeMessage: response.data.message })
                }
            })
        }
    }

    renderPlayItem({ item, index }) {
        return (
            <TouchableOpacity style={styles.playitemContainer} onPress={() => this.handlePlaylistClick(item)}>
                <Text style={styles.playlistTitleText}>{item.title}</Text>
            </TouchableOpacity>
        )
    }

    renderheader() {
        // get playlist name
        return (
            <View style={styles.titleContainer}>
                <Icon onPress={() => this.goBack()} style={styles.arrowBack} name="arrow-back" size={24} color="#fff" />
                <Text style={styles.titleText}>{this.state.playlistTitle || "Playlist Songs"}</Text>
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
                    <TouchableOpacity style={styles.heartlike} onPress={() => this.handleLikeClick(item, index)}>
                        {likedSong ?
                            <View style={styles.likeContainer}>
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

    onPressExitAlertPositiveButton = () => {
        BackHandler.exitApp()
        this.setState({ showExitAlert: false })
    };
    onPressExitAlertNegativeButton = () => {
        this.setState({ showExitAlert: false })
    };

    onPressLikeAlertPositiveButton = () => {
        this.setState({ showLikeAlert: false, alertLikeMessage: '' })
    }

    _handleLoadMore() {
        if (this.state.nextPage !== null) {
            getPlaylistSongs(this.props.token, this.state.pid, 10, this.state.nextPage).then(response => {
                if (response.status === 200) {
                    var joined = this.state.playlistSongData.concat(response.data.songs)
                    this.setState({ playlistSongData: joined, nextPage: response.data.next_page, screenState: 2 })
                }
            })
        }
    }

    _handleLoadMorePlaylist() {
        if (this.state.nextPagePlaylist !== null) {
            getPlaylist(this.props.token, 30, this.state.nextPagePlaylist).then(response => {
                if (response.status === 200) {
                    var joined = this.state.playlistData.concat(response.data.playlists)
                    this.setState({ playlistData: joined, nextPagePlaylist: response.data.next_page })
                }
            })
        }
    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <CustomAlertComponent
                    displayAlert={this.state.showExitAlert}
                    alertTitleText={'Confirm exit'}
                    alertMessageText={'Do you want to quit the app?'}
                    displayPositiveButton={true}
                    positiveButtonText={'OK'}
                    displayNegativeButton={true}
                    negativeButtonText={'CANCEL'}
                    onPressPositiveButton={this.onPressExitAlertPositiveButton}
                    onPressNegativeButton={this.onPressExitAlertNegativeButton}
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
                    {this.state.screenState === 1 ? <FlatList
                        style={styles.playlistFlatlist}
                        data={this.state.playlistData}
                        renderItem={this.renderPlayItem.bind(this)}
                        keyExtractor={item => String(item.pid)}
                        extraData={this.state.playlistData}
                        onEndReached={this._handleLoadMorePlaylist.bind(this)}
                        onEndReachedThreshold={0.5}
                        refreshControl={(
                            <RefreshControl
                                tintColor={'white'}
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefreshPlaylist}
                            />)}
                    />
                        :
                        this.state.screenState === 2 ?
                            <FlatList
                                ListHeaderComponent={this.renderheader()}
                                style={styles.playlistSongsFlatlist}
                                data={this.state.playlistSongData}
                                renderItem={this.renderSong.bind(this)}
                                keyExtractor={item => String(item.sid)}
                                extraData={this.state.playlistSongData}
                                onEndReached={this._handleLoadMore.bind(this)}
                                onEndReachedThreshold={0.5}
                                refreshControl={(
                                    <RefreshControl
                                        tintColor={'white'}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.onRefresh}
                                    />)}
                            />
                            : null
                    }

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

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistScreen);