import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { SafeAreaView } from "react-navigation";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import MusicPlayer from "../../components/musicPlayer/musicPlayer";

class MusicPlayerScreen extends React.Component {

    componentDidMount() {
        
    }

    musicDidEnd() {

    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    <MusicPlayer videoUrl={'https://dcumusicloudbucket.s3-eu-west-1.amazonaws.com/compiled_audio/-1.mp3'} videoDidEnd={this.musicDidEnd.bind(this)} navigation={this.props.navigation} />
                </View>

            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        songId: state.song.songId,
        songUrl: state.song.songUrl
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayerScreen);