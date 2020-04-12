import React from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from 'react-native-slider';
import Video from 'react-native-video';
import styles from "./styles";
import { formattedTime } from '../../utils/helpers';
import { TouchableOpacity } from "react-native-gesture-handler";
import { postLikeSong, postUnlikeSong } from "../../api/audioAPI";
import MusicControl from 'react-native-music-control';

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
        MusicControl.on('play', () => {
            this.togglePlay(this.state.playing)
        })
        MusicControl.on('pause', () => {
            this.togglePlay(this.state.playing)
        });
        MusicControl.on('nextTrack', () => {
            this.goForward()
        })

        MusicControl.on('previousTrack', () => {
            this.goBackward()
        })
        MusicControl.on('changePlaybackPosition', (time) => {
            this.setState({ currentTime: time })
            this.refs.audio.seek(this.state.currentTime);
            MusicControl.updatePlayback({
                elapsedTime: time,
            })
        })
    }

    componentDidMount() {
        // enable background mode
        MusicControl.enableBackgroundMode(true);
        // enable below controls
        MusicControl.enableControl('play', true)
        MusicControl.enableControl('pause', true)
        MusicControl.enableControl('stop', false)
        MusicControl.enableControl('nextTrack', true)
        MusicControl.enableControl('previousTrack', true)
        // Changing track position on lockscreen
        MusicControl.enableControl('changePlaybackPosition', true)
        // pause during audio interuptions (eg phone call)
        MusicControl.handleAudioInterruptions(true);
        
        MusicControl.enableControl('seek', true) // Android only
        MusicControl.enableControl('volume', true) // Only affected when remoteVolume is enabled
        MusicControl.enableControl('remoteVolume', true)
    }

    closePlayer() {
        MusicControl.resetNowPlaying()
    }

    togglePlay(playing) {
        this.setState({ playing: !this.state.playing });
        if (playing)
            MusicControl.updatePlayback({
                state: MusicControl.STATE_PAUSED,
                elapsedTime: this.state.currentTime,
            })
        else {
            MusicControl.updatePlayback({
                state: MusicControl.STATE_PLAYING,
                elapsedTime: this.state.currentTime,
            })
        }
    }

    toggleVolume() {
        this.setState({ muted: !this.state.muted });
    }

    addToPlaylist() {
        this.props.handlePlaylistClick()
    }

    goBackward() {
        if (this.state.currentTime < 3 && this.state.songIndex !== 0) {
            this.setState({
                songIndex: this.state.songIndex - 1,
                currentTime: 0,
                playing: true,
            });
            let songPlaying = this.props.songs[this.state.songIndex];
            let songCover = songPlaying.cover ? songPlaying.cover : 'https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/cover/1001_index.jpg'
            MusicControl.updatePlayback({
                state: MusicControl.STATE_PLAYING,
                elapsedTime: 0,
                title: songPlaying.title,
                artwork: songCover,
                artist: songPlaying.username,
                description: songPlaying.description,
                duration: this.state.songDuration,
            })
        } else {
            this.refs.audio.seek(0);
            this.setState({
                currentTime: 0,
            }, () => {
                MusicControl.updatePlayback({
                    elapsedTime: 0,
                })
            });
        }
    }

    goForward() {
        let songIdx = (this.state.songIndex + 1 < this.props.songs.length) ? this.state.songIndex + 1 : this.props.songs.length - 1
        this.setState({
            songIndex: songIdx,
            currentTime: 0,
            playing: true,
        }, () => {
            let songPlaying = this.props.songs[this.state.songIndex];
            let songCover = songPlaying.cover ? songPlaying.cover : 'https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/cover/1001_index.jpg'
            MusicControl.updatePlayback({
                state: MusicControl.STATE_PLAYING,
                elapsedTime: 0,
                title: songPlaying.title,
                artwork: songCover,
                artist: songPlaying.username,
                description: songPlaying.description,
            })
            setTimeout(function() {
                MusicControl.updatePlayback({
                    duration: this.state.songDuration,
                })
              }.bind(this), 500)
          
        });
        this.refs.audio.seek(0);
    }

    setTime(params) {
        if (!this.state.sliding) {
            this.setState({ currentTime: params.currentTime });
        }
    }

    onLoad(params) {
        this.setState({ numLikes: this.props.songs[this.state.songIndex].likes, liked: this.props.songs[this.state.songIndex].like_status, songDuration: params.duration })
        let songPlaying = this.props.songs[this.state.songIndex];
        let songCover = songPlaying.cover ? songPlaying.cover : 'https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/cover/1001_index.jpg'
        MusicControl.setNowPlaying({
            title: songPlaying.title,
            artwork: songCover,
            artist: songPlaying.username,
            description: songPlaying.description,
            duration: params.duration,
            notificationIcon: 'ic_notification',
        });
        MusicControl.updatePlayback({
            state: MusicControl.STATE_PLAYING,
        });

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
        MusicControl.updatePlayback({
            state: MusicControl.STATE_PAUSED,
            elapsedTime: this.state.currentTime,
        })
    }

    handleArrowBack() {

    }

    handleProfileClick() {
        this.setState({ playing: false });
        this.props.handleProfileClick()
        MusicControl.stopControl()
    }

    likeSong() {
        postLikeSong(this.props.accessToken, this.props.songs[this.state.songIndex].sid).then(response => {
            this.setState({ liked: !this.state.liked, numLikes: this.state.numLikes + 1 })
        })
    }

    unlikeSong() {
        postUnlikeSong(this.props.accessToken, this.props.songs[this.state.songIndex].sid).then(response => {
            this.setState({ liked: !this.state.liked, numLikes: this.state.numLikes - 1 })
        })
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
            playButton = <Icon onPress={this.togglePlay.bind(this, this.state.playing)} style={styles.play} name="pause" size={70} color="#fff" />;
        } else {
            playButton = <Icon onPress={this.togglePlay.bind(this, this.state.playing)} style={styles.play} name="play-arrow" size={70} color="#fff" />;
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
                    playInBackground={true}
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