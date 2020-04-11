import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Platform, TextInput, BackHandler } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { ratio, screenWidth } from '../../utils/styles';
import { postFile, putUploadFile, putUploadAudioFile } from "../../api/uploadApi";
import CustomAlertComponent from "../../components/alertComponent/customAlert";
import DocumentPicker from 'react-native-document-picker';
import { LogLevel, RNFFmpeg, RNFFmpegConfig } from 'react-native-ffmpeg';
import { postAudioFiles } from "../../api/audioAPI";

const { width, height } = Dimensions.get('window');

class StudioScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            screenState: 1,
            showAlert: false,
            showExitAlert: false,
            alertTitle: '',
            alertMessage: '',
            uploading: false,
            recording: false,
            urlKey: '',
            filename: '',
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

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    handleAndroidBackPress = () => {
        if (this.state.screenState === 2) {
            this.setState({ screenState: 1 })
            return true;
        } else {
            this.setState({ showExitAlert: true })
            return true
        }
    }

    async handleUploadButtonClick() {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio],
            });
            let extension = res.type.split('/').slice(-1)[0]
            let filename = `${res.name}`
            this.uploadSelectedAudio(filename, res.type, res.uri)
            console.log(
                res.uri,
                res.type, // mime type
                res.name,
                res.size
            );
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }

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

    onStatusPress = (e) => {
        const touchX = e.nativeEvent.locationX;
        console.log(`touchX: ${touchX}`);
        const playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (screenWidth - 56 * ratio);
        console.log(`currentPlayWidth: ${playWidth}`);

        const currentPosition = Math.round(this.state.currentPositionSec);
        console.log(`currentPosition: ${currentPosition}`);

        if (playWidth && playWidth < touchX) {
            const addSecs = Math.round(currentPosition + 3000);
            this.audioRecorderPlayer.seekToPlayer(addSecs);
            console.log(`addSecs: ${addSecs}`);
        } else {
            const subSecs = Math.round(currentPosition - 3000);
            this.audioRecorderPlayer.seekToPlayer(subSecs);
            console.log(`subSecs: ${subSecs}`);
        }
    };

    onStartRecord = async () => {
        this.setState({ recording: true })
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
        this.setState({ recording: false })
        const result = await this.audioRecorderPlayer.stopRecorder();
        this.audioRecorderPlayer.removeRecordBackListener();
        this.setState({
            recordSecs: 0,
            duration: this.state.recordTime,
            uri: result
        });
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
        console.log('onStopPlay');
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
        this.setState({ currentPositionSec: 0, playTime: '00:00:00' })
    };

    uploadClick = async () => {
        if (this.state.uri) {
            this.uploadAudio()
        } else {
            console.log('no recordings detected')
        }
    }

    firstUploadClick() {
        if (this.state.uri) {
            this.setState({ uploading: true })
        } else {
            this.setState({ alertTitle: 'Error', alertMessage: 'No recorded Audio detected', showAlert: true })
        }
    }

    uploadAudioSuccess() {
        this.setState({ uploading: false })
        this.setState({ alertTitle: 'Success', alertMessage: 'Successfully uploaded to s3 bucket', showAlert: true })
    }

    uploadAudioFail() {
        this.setState({ uploading: false })
        this.setState({ alertTitle: 'Error', alertMessage: 'Failed to upload recording', showAlert: true })
    }

    makeSignedUrl(object) {
        return (object.url + object.fields.key)
    }

    async uploadSelectedAudio(filename, filetype, uri) {
        await postFile(this.props.token, 'audio', filename, `audio/x-${filetype}`).then(response => {
            if (isNaN(response)) {
                if (response.signed_url.fields.key) {
                    this.setState({ urlKey: response.signed_url.fields.key })
                    let urlKey = response.signed_url.fields.key
                    let url = this.makeSignedUrl(response)
                    putUploadAudioFile(urlKey, uri, filetype, this.uploadAudioSuccess.bind(this), this.uploadAudioFail.bind(this))
                    postAudioFiles(this.props.token, url, filename)
                }
            }
        })
    }

    async uploadAudio() {

        let filetype = 'mp4'
        let filename = this.state.filename + '.' + filetype
        let input = this.state.uri
        let output = Platform.OS === 'android' ? this.state.uri : this.state.uri.replace('m4a', 'mp4')
        if (__DEV__) {
            logCallback = (logData) => {
                console.log('ffmpeg: ' + logData.log);
            };
        }
        
        RNFFmpegConfig.enableLogCallback(this.logCallback);
        RNFFmpegConfig.setLogLevel(LogLevel.AV_LOG_INFO);
        
        await RNFFmpeg.execute(`-i ${input} -c:v mpeg4 ${output}`).then(result => {
            if (__DEV__) {
                console.log("FFmpeg process exited with rc " + JSON.stringify(result))
            }
            this.postRecording(filename, filetype, output)
        });
    }

    async postRecording(filename, filetype, output) {
        await postFile(this.props.token, 'audio', filename, `audio/x-${filetype}`).then(response => {
            if (isNaN(response)) {
                if (response.signed_url.fields.key) {
                    this.setState({ urlKey: response.signed_url.fields.key })
                    let urlKey = response.signed_url.fields.key
                    let url = this.makeSignedUrl(response.signed_url)
                    putUploadAudioFile(urlKey, output, filetype, this.uploadAudioSuccess.bind(this), this.uploadAudioFail.bind(this))
                    postAudioFiles(this.props.token, url, filename)
                }
            }
        })
    }

    goBackToStudio = async () => {
        this.setState({ screenState: 1 })
    }

    renderRecord() {
        let playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (width - 56 * ratio);
        if (!playWidth) playWidth = 0;

        let microphoneImage = require('../../assets/images/microphone.png')
        let playImg = require('../../assets/images/play_arrow.png')
        let pauseImg = require('../../assets/images/pause.png')
        let stopImg = require('../../assets/images/stop.png')
        let backImg = require('../../assets/images/cross.png')

        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backBtn} onPress={this.goBackToStudio}>
                    <Image style={styles.goBackImg} source={backImg} />
                </TouchableOpacity>
                <View style={styles.recordContainer}>
                    <Text style={styles.titleTxt}>{'Record'}</Text>
                    <Text style={styles.txtRecordCounter}>{this.state.recordTime}</Text>
                    <View style={styles.viewRecorder}>
                        <View style={styles.recordBtnWrapper}>
                            {!this.state.recording ?
                                <TouchableOpacity style={styles.recordBtn} onPress={this.onStartRecord}>
                                    <Image style={styles.microphoneImage} source={microphoneImage} />
                                </TouchableOpacity> :
                                <View style={styles.stopRecContainer}>
                                    <TouchableOpacity style={styles.stopRecBtn} onPress={this.onStopRecord} />
                                </View>
                            }
                        </View>
                    </View>

                    <View style={styles.viewPlayer}>
                        <TouchableOpacity
                            style={styles.viewBarWrapper}
                            onPress={this.onStatusPress}
                        >
                            <View style={styles.viewBar}>
                                <View style={[styles.viewBarPlay, { width: playWidth }]} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.txtCounter}>
                            {this.state.playTime} / {this.state.duration}
                        </Text>
                        <View style={styles.playBtnWrapper}>
                            <TouchableOpacity onPress={this.onStartPlay} style={styles.playerImgs}>
                                <Image style={styles.playImgs} source={playImg} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this.state.recording ? this.onStopRecord : this.onPausePlay} style={styles.playerImgs}>
                                <Image style={styles.playImgs} source={pauseImg} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this.onStopPlay} style={styles.playerImgs}>
                                <Image style={styles.playImgs} source={stopImg} />
                            </TouchableOpacity>

                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.uploadContainer} onPress={() => this.firstUploadClick()}>
                            <Text style={styles.uploadText}>{'Upload'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    setTextInput(text) {
        this.setState({ filename: text });
    }

    renderAudioName() {
        let crossImg = require('../../assets/images/cross.png')
        return (
            <View style={styles.grayContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.topAudioNameContainer}>
                        <Text style={styles.loginLabelName}>{'Filename'}</Text>
                        <TouchableOpacity onPress={() => this.setState({ uploading: false })}>
                            <Image source={crossImg} style={styles.crossImg} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        spellCheck={false}
                        value={this.props.value}
                        editable={this.state.editable}
                        underlineColorAndroid='rgba(0,0,0,0)'
                        keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                        onChangeText={text => this.setTextInput(text)}
                        ref={input => this.textInput = input}
                        style={styles.audioNameInput} />
                    <TouchableOpacity onPress={this.uploadClick}>
                        <Text style={styles.uploadFinalText}>{'Upload'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    onPressAlertPositiveButton = () => {
        this.setState({ showAlert: false })
    };

    onPressExitAlertPositiveButton = () => {
        BackHandler.exitApp()
        this.setState({ showExitAlert: false })
    };
    onPressExitAlertNegativeButton = () => {
        this.setState({ showExitAlert: false })
    };

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <CustomAlertComponent
                    displayAlert={this.state.showAlert}
                    alertTitleText={this.state.alertTitle}
                    alertMessageText={this.state.alertMessage}
                    displayPositiveButton={true}
                    positiveButtonText={'OK'}
                    onPressPositiveButton={this.onPressAlertPositiveButton}
                />
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
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    {this.state.screenState === 1 && this.renderStudio()}
                    {this.state.screenState === 2 && this.renderRecord()}
                    {this.state.uploading && this.renderAudioName()}
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        username: state.home.username,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(StudioScreen);