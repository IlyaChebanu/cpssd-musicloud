import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert, TouchableWithoutFeedback, TextInput } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { SafeAreaView } from "react-navigation";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { getUserInfo } from "../../api/usersAPI";
import Player from "../../components/player/player";
import { getPlaylist, postPlaylistSong, postPlaylist } from "../../api/audioAPI";
import Icon from 'react-native-vector-icons/MaterialIcons';

class MusicPlayerScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //   userDetails: {},
            playlistsData: [],
            showAddPlaylist: false,
            showCreatePlaylist: false,
            playlistTitle: '',
        };
    }

    componentDidMount() {
        this.getPlaylist()
    }

    showAlert(title, text, action) {
        Alert.alert(
            title,
            text,
            [
                { text: 'OK', onPress: action },
            ],
            { cancelable: false },
        );
    }

    getPlaylist() {
        getPlaylist(this.props.token).then(response => {
            if (response.status === 200) {
                this.setState({ playlistsData: response.data.playlists })
            }
        })
    }

    handleAuthorClick() {
        this.props.navigateBack()
        this.props.navigateToUserProfileScreen()
    }

    createNewPlaylist() {
        this.setState({ showAddPlaylist: false, showCreatePlaylist: true })
    }

    setPlaylistTitle(text) {
        this.setState({ playlistTitle: text })
    }

    handleCreatePlaylist() {
        postPlaylist(this.props.token, this.state.playlistTitle).then(response => {
            if (response.status === 200) {
                this.setState({ showCreatePlaylist: false })
                this.showAlert('Playlist Created', `Playlist succesfully created: ${this.state.playlistTitle}`)
                this.getPlaylist()
            } else {
                this.setState({ showCreatePlaylist: false })
                this.showAlert('Error', response.data.message)
            }
        })
    }

    renderCreatePlaylist() {
        return (
            <View style={styles.playlistWindow}>
                <Text style={styles.newPlayText}>{'Create new playlist'}</Text>
                <TextInput 
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    spellCheck={false}
                    placeholderTextColor="white"
                    underlineColorAndroid='rgba(0,0,0,0)'
                    keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                    onChangeText={text => this.setPlaylistTitle(text)}
                    style={styles.playlistTitle} />
                <TouchableOpacity onPress={() => this.handleCreatePlaylist()}>
                    <Text style={styles.createText}>{'CREATE'}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    addSongToPlaylist(item) {
        postPlaylistSong(this.props.token, item.pid, this.props.songId).then(response => {
            if (response.status === 200) {
                this.setState({ showAddPlaylist: false })
                this.showAlert('Song Added', `Song succesfully added to ${item.title}`)
            } else {
                this.setState({ showAddPlaylist: false })
                this.showAlert('Error', response.data.message)
            }
        })
    }

    renderHeader() {
        return (
            <View style={styles.addContainer}>
                <Text style={styles.addText}>{'Add to playlist'}</Text>
            </View>
        )
    }

    renderFooter() {
        return (
            <TouchableOpacity style={styles.newContainer} onPress={() => this.createNewPlaylist()}>
                <Text style={styles.NewText}>{'New Playlist'}</Text>
                <Icon style={styles.addIcon} name="add" size={16} color="#fff" />
            </TouchableOpacity>
        )
    }

    renderPlayItem({ item, index }) {
        return (
            <TouchableOpacity style={styles.playitemContainer} onPress={() => this.addSongToPlaylist(item)}>
                <Text style={styles.playitemText}>{item.title}</Text>
            </TouchableOpacity>
        )
    }

    renderPlaylist() {
        return (
            <View style={styles.playlistWindow}>
                <FlatList
                    ListHeaderComponent={this.renderHeader()}
                    ListFooterComponent={this.renderFooter()}
                    style={styles.playlistFlatList}
                    data={this.state.playlistsData}
                    renderItem={this.renderPlayItem.bind(this)}
                    keyExtractor={item => String(item.pid)}
                    extraData={this.state.playlistsData}
                />
            </View>
        )
    }

    handlePlaylistClick() {
        this.setState({ showAddPlaylist: true, showCreatePlaylist: false })
    }

    navBack() {
        this.props.setSongUpdate(!this.props.songUpdate)
        this.props.navigateBack()
    }

    render() {
        var logoImage = require("../../assets/images/logo1.png");
        var arrowDownImg = require("../../assets/images/arrow_down.png");
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <TouchableWithoutFeedback onPress={() => this.setState({ showAddPlaylist: false, showCreatePlaylist: false })}>
                    <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                        <View style={styles.headerContainer}>
                            <Image style={styles.logo} source={logoImage} />
                            <TouchableOpacity style={styles.arrowDown} onPress={() => this.navBack()}>
                                <Image style={styles.arrowDownImg} source={arrowDownImg} />
                            </TouchableOpacity>
                        </View>
                        {/* <HeaderComponent navigation={this.props.navigation} /> */}
                        <Player
                            songIndex={this.props.songIndex}
                            handlePlaylistClick={this.handlePlaylistClick.bind(this)}
                            handleProfileClick={this.handleAuthorClick.bind(this)}
                            accessToken={this.props.token}
                            profilePic={this.props.otherUserData.profile_pic_url ? this.props.otherUserData.profile_pic_url : null}
                            songs={this.props.songData}
                        />
                    </View>
                </TouchableWithoutFeedback>
                {this.state.showAddPlaylist && this.renderPlaylist()}
                {this.state.showCreatePlaylist && this.renderCreatePlaylist()}
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        otherUserData: state.user.otherUserData,
        songId: state.song.songId,
        songIndex: state.song.songIndex,
        songUrl: state.song.songUrl,
        songData: state.song.songData,
        songUpdate: state.song.songUpdate,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayerScreen);