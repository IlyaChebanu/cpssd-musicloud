import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";

export default class StudioScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            screenState: 1,
        };
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

    renderRecord() {
        return(
            <View style={styles.container}>

            </View>
        )
    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    {this.renderStudio()}
                </View>
            </SafeAreaView>
        )
    }
}