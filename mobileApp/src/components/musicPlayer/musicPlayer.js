import React from 'react';
import { Dimensions, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from './styles';
import Video from 'react-native-video';
import Spinner from '../spinner/spinner';

const { width, height } = Dimensions.get('window');

export default class MusicPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaused: true,
            isError: false,
            videoUrl: props.videoUrl,
            songData: props.songData,
            navigation: props.navigation,
            isBuffering: true,
            muted: false,
        };
    }

    componentWillMount() {

    }

    componentDidMount() {
        if (__DEV__) {
            console.log("MusicPlayer : MusicPlayer SCREEN MOUNTED ")
        }
    }

    componentWillUnmount() {
        if (__DEV__) {
            console.log("MusicPlayer : MusicPlayer SCREEN UNMOUNTED ")
        }
    }

    musicError(error) {
        if (__DEV__) {
            console.log("MusicPlayer : MusicPlayer ERROR ")
        }
        this.setState({ isError: true });
    }

    onBuffer(isBuffering) {
        if (__DEV__) {
            console.log("MusicPlayer: BUFFERING " + JSON.stringify(isBuffering))
        }
        this.setState({ isBuffering: isBuffering.isBuffering });
    }

    onLoad(data) {
        
    }

    onEnd(data) {
        if (__DEV__) {
            console.log('MusicPlayer: Music has ended');
        }
        this.props.musicDidEnd()
        this.player.seek(0)
    }

    onSeek() {
        this.setState({ isPaused: true });
    }

    togglePlay() {
        if (__DEV__) {
            console.log('MusicPlayer: Music isPaused: ' + !this.state.isPaused);
        }
        this.setState({ isPaused: !this.state.isPaused });
    }

    setTime() {

    }

    handlePlayClick() {
        this.togglePlay()
    }

    render() {
        let songImage = this.state.songData[7]
        let playButtonImg = this.state.isPaused ? require('../../assets/images/play_arrow.png') : require('../../assets/images/pause.png')
        return (

            <View style={styles.container}>
                <Video source={{ uri: this.state.videoUrl }}   // Can be a URL or a local file.
                    ref={(ref) => { this.player = ref }}
                    volume={this.state.muted ? 0 : 1.0}
                    onBuffer={this.onBuffer.bind(this)}
                    onError={this.musicError.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                    onProgress={this.setTime.bind(this)}
                    onEnd={this.onEnd.bind(this)}
                    onSeek={this.onSeek.bind(this)}
                    paused={this.state.isPaused}
                    controls={true}
                    style={styles.backgroundVideo} />

                <Image source={{uri: songImage}} style={styles.songImg} />
                <View style={styles.textContainer}>
                    <Text style={styles.songNameText}>{this.state.songData[2]}</Text>
                    <Text style={styles.songTypeText}>{this.state.songData[8]}</Text>
                </View>
                <TouchableOpacity onPress={() => this.handlePlayClick()} style={styles.playButton}>
                    <Image source={playButtonImg} />
                </TouchableOpacity>
                
                {(this.state.isBuffering && !this.state.isPaused) &&
                    <Spinner colour={'white'} />
                }
            </View>
        )
    }
}