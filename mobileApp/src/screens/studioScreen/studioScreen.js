import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Platform } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { ratio } from '../../utils/styles';
import { postFile, putUploadFile, putUploadAudioFile } from "../../api/uploadApi";

const { width, height } = Dimensions.get('window');
const audioRecorderPlayer = new AudioRecorderPlayer();
const path = Platform.select({
    ios: 'hello.m4a',
    android: 'musicloud/hello.mp4', // should give extra dir name in android. Won't grant permission to the first level of dir.
});

class StudioScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            screenState: 1,

            urlKey: '',

            recordSecs: 0,
            recordTime: '00:00:00',
            currentPositionSec: 0,
            currentDurationSec: 0,
            playTime: '00:00:00',
            duration: '00:00:00',
            uri: null,
        };
        this.audioRecorderPlayer = new AudioRecorderPlayer();
    }

    handleUploadButtonClick() {
        // this.setState({ screenState: 3 })
    }

    handleRecordButtonClick() {
        this.setState({ screenState: 2 })
    }

    renderStudio() {
        return (
            <View style={styles.container}>
                <Text style={styles.titleText}>{"STUDIO"}</Text>

                <MultiPurposeButton
                    handleButtonClick={this.handleUploadButtonClick.bind(this)}
                    style={styles.uploadButton}
                    buttonName={"Upload"}
                />
                <MultiPurposeButton
                    handleButtonClick={this.handleRecordButtonClick.bind(this)}
                    style={styles.recordButton}
                    buttonName={"Record"}
                />
            </View>
        )
    }

    onStartRecord = async () => {
        const result = await this.audioRecorderPlayer.startRecorder();
        this.audioRecorderPlayer.addRecordBackListener((e) => {
            this.setState({
                recordSecs: e.current_position,
                recordTime: this.audioRecorderPlayer.mmssss(
                    Math.floor(e.current_position),
                ),
            });
            return;
        });
        
        console.log(result);
    };

    onStopRecord = async () => {
        const result = await this.audioRecorderPlayer.stopRecorder();
        this.audioRecorderPlayer.removeRecordBackListener();
        this.setState({
            recordSecs: 0,
        });
        this.setState({ uri: result })
        console.log(result);
    };

    onStartPlay = async () => {
        console.log('onStartPlay');
        const msg = await this.audioRecorderPlayer.startPlayer();
        console.log(msg);
        this.audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.current_position === e.duration) {
                console.log('finished');
                this.audioRecorderPlayer.stopPlayer();
            }
            this.setState({
                currentPositionSec: e.current_position,
                currentDurationSec: e.duration,
                playTime: this.audioRecorderPlayer.mmssss(Math.floor(e.current_position)),
                duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
            });
            return;
        });
    };

    onPausePlay = async () => {
        await this.audioRecorderPlayer.pausePlayer();
    };

    onStopPlay = async () => {
        // console.log('onStopPlay');
        // this.audioRecorderPlayer.stopPlayer();
        // this.audioRecorderPlayer.removePlayBackListener();
        this.uploadAudio()
    };

    async uploadAudio() {
        // const path = Platform.select({
        //     ios: 'hello.m4a',
        //     android: 'musicloud/hello.mp4', // should give extra dir name in android. Won't grant permission to the first level of dir.
        // });
        let filetype = 'm4a'
        let randomString = Math.random().toString(36).substr(2, 7)
        randomString = randomString + '.m4a'
        await postFile(this.props.token, 'audio', '/kamil/testing.m4a', 'audio/x-m4a').then(response => {
            if (isNaN(response)) {
                if (response.signed_url.fields.key) {
                  this.setState({ urlKey: response.signed_url.fields.key })
                  let urlKey = response.signed_url.fields.key
                  let signedUrl = response.signed_url.url
                //   let picUrl = signedUrl + urlKey
                  putUploadAudioFile(urlKey, this.state.uri, filetype).then(response => {
                    if (response === 200) {
                    //   this.props.setPicUrl(picUrl)
                    } else {
                      this.setState({alertTitle: 'Error', alertMessage: 'Failed to upload', showAlert: true })
                    }
                  })
                }
              }
        })
    }

    renderRecord() {
        let playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (width - 56 * ratio);
        if (!playWidth) playWidth = 0;

        return (
            <View style={styles.recordContainer}>
                {/* <Text>{'test'}</Text>
                <Text style={styles.txtRecordCounter}>{this.state.recordTime}</Text>
                <TouchableOpacity onPress={this.onStartRecord}>
                    <Text style={[styles.txt, styles.btn]}>RECORD</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onStopRecord}>
                    <Text style={[styles.txt, styles.btn]}>STOP</Text>
                </TouchableOpacity> */}

                <Text style={styles.titleTxt}>{'Record'}</Text>
                <Text style={styles.txtRecordCounter}>{this.state.recordTime}</Text>
                <View style={styles.viewRecorder}>
                    <View style={styles.recordBtnWrapper}>
                        <TouchableOpacity onPress={this.onStartRecord}>
                            <Text style={[styles.txt, styles.btn]}>RECORD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onStopRecord}>
                            <Text style={[styles.txt, styles.btn]}>STOP</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.viewPlayer}>
                    <TouchableOpacity
                        style={styles.viewBarWrapper}
                    // onPress={this.onStatusPress}
                    >
                        <View style={styles.viewBar}>
                            <View style={[styles.viewBarPlay, { width: playWidth }]} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.txtCounter}>
                        {this.state.playTime} / {this.state.duration}
                    </Text>
                    <View style={styles.playBtnWrapper}>
                        <TouchableOpacity onPress={this.onStartPlay}>
                            <Text style={[styles.txt, styles.btn]}>PLAY</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.onPausePlay}>
                            <Text style={[styles.txt, styles.btn]}>PAUSE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.onStopPlay}>
                            <Text style={[styles.txt, styles.btn]}>STOP</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    {this.state.screenState === 1 && this.renderStudio()}
                    {this.state.screenState === 2 && this.renderRecord()}
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        // userData: state.user.userData,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(StudioScreen);