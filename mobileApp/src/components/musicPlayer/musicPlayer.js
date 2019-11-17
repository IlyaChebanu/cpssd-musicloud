import React from 'react'
import { Dimensions, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
// import GLOBALS from '../../utils/globalStrings';
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
            navigation: props.navigation,
            isBuffering: true,
        };
    }

    componentWillMount() {

    }

    componentDidMount() {
        console.log("MusicPlayer : MusicPlayer SCREEN MOUNTED ")
    }

    componentWillUnmount() {
        console.log("MusicPlayer : MusicPlayer SCREEN UNMOUNTED ")
    }

    musicError(error) {
        console.log("MusicPlayer : MusicPlayer ERROR ")// + JSON.stringify(error))
        this.setState({ isError: true });
    }

    onBuffer(isBuffering) {
        console.log("MusicPlayer: BUFFERING " + JSON.stringify(isBuffering))
        this.setState({ isBuffering: isBuffering.isBuffering });
    }

    onLoad(data) {
        // console.log('MusicPlayer: On load fired! ' + JSON.stringify(data));
        // this.props.musicDidEnd()
    }

    onEnd(data) {
        console.log('MusicPlayer: Music has ended');
        this.props.musicDidEnd()
        this.player.seek(0)
    }

    onSeek() {
        this.setState({ isPaused: true });
    }

    togglePlay() {
        console.log('MusicPlayer: Music isPaused: ' + !this.state.isPaused);
        this.setState({ isPaused: !this.state.isPaused });
    }


    render() {
        let videoText = this.state.isError ? 'ERROR PLAYING MUSIC' : 'TAP ANYWHERE TO WATCH'
        return (

            <View style={styles.container}>
                <Video source={{ uri: this.state.videoUrl }}   // Can be a URL or a local file.
                    ref={(ref) => { this.player = ref }}
                    onBuffer={this.onBuffer.bind(this)}
                    onError={this.musicError.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                    onEnd={this.onEnd.bind(this)}
                    onSeek={this.onSeek.bind(this)}
                    paused={this.state.isPaused}
                    controls={true}
                    style={styles.backgroundVideo} />

                {this.state.isPaused ? <Image style={styles.selectedChannelImage} source={require("../../assets/images/play.png")} /> : null}
                {this.state.isPaused ? <Text style={styles.videoText}>{videoText}</Text> : null}

                {/* <TouchableOpacity style={styles.backgroundVideo} onPress={() => this.togglePlay()} /> */}
                {(this.state.isBuffering && !this.state.isPaused) &&
                    <Spinner colour={'white'} />
                }
            </View>
        )
    }
}