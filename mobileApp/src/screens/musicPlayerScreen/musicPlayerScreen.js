import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
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

    handleAuthorClick() {
        // this.props.navigateToHomeScreen()
        // this.props.setViewingProfile(true)
        this.props.navigation.navigate('Profile')
        // this.props.navigateBack()
    }

    render() {
        var logoImage = require("../../assets/images/logo.png");
        var arrowDownImg = require("../../assets/images/arrow_down.png");
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <View style={styles.headerContainer}>
                        <Image style={styles.logo} source={logoImage} />
                        <TouchableOpacity style={styles.arrowDown} onPress={() => this.props.navigateBack()}>
                            <Image style={styles.arrowDownImg} source={arrowDownImg} />
                        </TouchableOpacity>
                    </View>
                    <MusicPlayer songData={this.props.songData} videoUrl={this.props.songUrl} musicDidEnd={this.musicDidEnd.bind(this)} navigation={this.props.navigation} handleAuthorClick={this.handleAuthorClick.bind(this)} />
                </View>

            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        songId: state.song.songId,
        songUrl: state.song.songUrl,
        songData: state.song.songData,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayerScreen);