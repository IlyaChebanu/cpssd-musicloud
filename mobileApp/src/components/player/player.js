import React from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from 'react-native-slider';
import Video from 'react-native-video';
import styles from "./styles";
import { formattedTime } from '../../utils/helpers';
import { TouchableOpacity } from "react-native-gesture-handler";

const { width, height } = Dimensions.get('window');

export default class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: true,
            muted: false,
            sliding: false,
            currentTime: 0,
            songIndex: props.songIndex,
            liked: props.SongPlaying ? props.SongPlaying.like_status : 0,
            numLikes: props.SongPlaying ? props.SongPlaying.like_status : 0,
        };
    }

    togglePlay() {
        this.setState({ playing: !this.state.playing });
    }

    toggleVolume() {
        this.setState({ muted: !this.state.muted });
    }

    addToPlaylist() {

    }

    goBackward() {
        if (this.state.currentTime < 3 && this.state.songIndex !== 0) {
            this.setState({
                songIndex: this.state.songIndex - 1,
                currentTime: 0,
            });
        } else {
            this.refs.audio.seek(0);
            this.setState({
                currentTime: 0,
            });
        }
    }

    goForward() {
        this.setState({
            songIndex: this.state.songIndex + 1,
            currentTime: 0,
        });
        this.refs.audio.seek(0);
    }

    setTime(params) {
        if (!this.state.sliding) {
            this.setState({ currentTime: params.currentTime });
        }
    }

    onLoad(params) {
        this.setState({ numLikes: this.props.songs[this.state.songIndex].likes})
        this.setState({ songDuration: params.duration });
    }

    onSlidingStart() {
        this.setState({ sliding: true });
    }

    onSlidingChange(value) {
        let newPosition = value * this.state.songDuration;
        this.setState({ currentTime: newPosition });
    }

    onSlidingComplete() {
        this.refs.audio.seek(this.state.currentTime);
        this.setState({ sliding: false });
    }

    onEnd() {
        this.setState({ playing: false });
    }

    handleArrowBack() {

    }

    handleProfileClick() {

    }

    likeSong() {
        this.setState({ liked: !this.state.liked, numLikes: this.state.numLikes + 1 })
    }

    unlikeSong() {
        this.setState({ liked: !this.state.liked, numLikes: this.state.numLikes - 1 })
    }

    render() {
        let songPlaying = this.props.songs[this.state.songIndex];
        let songPercentage;
        if (this.state.songDuration !== undefined) {
            songPercentage = this.state.currentTime / this.state.songDuration;
        } else {
            songPercentage = 0;
        }

        let playButton;
        if (this.state.playing) {
            playButton = <Icon onPress={this.togglePlay.bind(this)} style={styles.play} name="pause" size={70} color="#fff" />;
        } else {
            playButton = <Icon onPress={this.togglePlay.bind(this)} style={styles.play} name="play-arrow" size={70} color="#fff" />;
        }

        let forwardButton;
        if (this.state.songIndex + 1 === this.props.songs.length) {
            forwardButton = <Icon style={styles.forward} name="skip-next" size={25} color="#333" />;
        } else {
            forwardButton = <Icon onPress={this.goForward.bind(this)} style={styles.forward} name="skip-next" size={25} color="#fff" />;
        }

        let volumeButton;
        if (this.state.muted) {
            volumeButton = <Icon onPress={this.toggleVolume.bind(this)} style={styles.volume} name="volume-off" size={18} color="#fff" />;
        } else {
            volumeButton = <Icon onPress={this.toggleVolume.bind(this)} style={styles.volume} name="volume-up" size={18} color="#fff" />;
        }

        let addToPlaylistButton = <Icon onPress={this.addToPlaylist.bind(this)} style={styles.addplaylist} name="playlist-add" size={18} color="#fff" />;
        let image = songPlaying ? songPlaying.cover : null;
        let songUrl = songPlaying ? songPlaying.url : null;
        let placeholderImg = require('../../assets/images/cloud.png');
        let profilePicPlaceholder = require('../../assets/images/profilePlaceholder.png');
        let profilePic = this.props.profilePic
        let like = songPlaying ? songPlaying.like_status : 0
        let numLikes = songPlaying ? songPlaying.likes : 0

        return (
            <View style={styles.container}>
                <Video source={{ uri: songUrl }}
                    ref="audio"
                    volume={this.state.muted ? 0 : 1.0}
                    muted={false}
                    paused={!this.state.playing}
                    onLoad={this.onLoad.bind(this)}
                    onProgress={this.setTime.bind(this)}
                    onEnd={this.onEnd.bind(this)}
                    resizeMode="cover"
                    repeat={false} />

                <View style={styles.headerClose}>
                    <Icon onPress={this.handleArrowBack()} name="keyboard-arrow-down" size={15} color="#fff" />
                </View>
                {image ? <Image style={styles.songImage} source={{ uri: image }} /> :
                    <Image source={placeholderImg} style={styles.songImage} />}
                <View style={styles.titleContainer}>
                    <Text style={styles.songTitle}>
                        {songPlaying ? songPlaying.title : 'Title'}
                    </Text>
                    <View style={styles.likeContainer}>
                        <Text style={this.state.liked ? styles.likesText : styles.unlikesText}>{this.state.numLikes}</Text>
                        {this.state.liked ?
                            <Icon style={styles.likeIcon} onPress={() => this.unlikeSong()} name="favorite" size={32} color="#F4414F" />
                            :
                            <Icon style={styles.likeIcon} onPress={() => this.likeSong()} name="favorite" size={32} color="#fff" />
                        }
                    </View>
                </View>
                <TouchableOpacity onPress={() => this.handleProfileClick()}>
                    <View style={styles.profileContainer}>
                        {profilePic ? <Image style={styles.profileImg} source={{ uri: profilePic }} /> :
                            <Image style={styles.profileImg} source={profilePicPlaceholder} />}
                        <Text style={styles.authorText}>
                            {songPlaying ? songPlaying.username : 'Username'}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.sliderContainer}>
                    <Slider
                        onSlidingStart={this.onSlidingStart.bind(this)}
                        onSlidingComplete={this.onSlidingComplete.bind(this)}
                        onValueChange={this.onSlidingChange.bind(this)}
                        minimumTrackTintColor='#851c44'
                        style={styles.slider}
                        trackStyle={styles.sliderTrack}
                        thumbStyle={styles.sliderThumb}
                        value={songPercentage} />

                    <View style={styles.timeInfo}>
                        <Text style={styles.time}>{formattedTime(this.state.currentTime)}</Text>
                        <Text style={styles.timeRight}>- {formattedTime(this.state.songDuration - this.state.currentTime)}</Text>
                    </View>
                </View>
                <View style={styles.controls}>
                    {addToPlaylistButton}
                    <Icon onPress={this.goBackward.bind(this)} style={styles.back} name="skip-previous" size={25} color="#fff" />
                    {playButton}
                    {forwardButton}
                    {volumeButton}
                </View>
            </View>
        )
    }
}