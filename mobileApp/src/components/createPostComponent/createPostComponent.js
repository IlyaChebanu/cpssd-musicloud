import React, { Component } from "react";
import { View, TouchableOpacity, Alert, Text, TextInput, Platform } from 'react-native';
import GLOBALS from '../../utils/globalStrings';
import styles from './styles';
import LinearGradient from "react-native-linear-gradient";
import { createUserPost } from "../../api/usersAPI";
import CustomAlertComponent from "../alertComponent/customAlert";

export default class CreatePostComponent extends Component {

    constructor(props) {
        super(props)

        this.state = {
            postMessage: '',
            showAlert: false,
            alertTitle: '',
            alertMessage: '',
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }

    setTextInput(text) {
        this.setState({ postMessage: text })
    }

    clearPost() {
        this.props.createdPost()
        this.setState({ postMessage: '' })
        this.postTextInput.clear()
    }

    handlePostButtonClick() {
        createUserPost(this.state.postMessage, this.props.accessToken).then(response => {
            if (response.status === 200) {
                this.clearPost()
            } else {
                this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'createUserPost Failed', showAlert: true })
            }
        })
    }

    onPressAlertPositiveButton = () => {
        this.setState({ showAlert: false })
    };

    render() {
        return (
            <View keyboardShouldPersistTaps={true} style={[this.props.style, styles.container]} >
                <CustomAlertComponent
                    displayAlert={this.state.showAlert}
                    alertTitleText={this.state.alertTitle}
                    alertMessageText={this.state.alertMessage}
                    displayPositiveButton={true}
                    positiveButtonText={'OK'}
                    onPressPositiveButton={this.onPressAlertPositiveButton}
                />
                <TextInput
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    multiline={true}
                    spellCheck={false}
                    placeholder="Write something..."
                    placeholderTextColor="white"
                    underlineColorAndroid='rgba(0,0,0,0)'
                    keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                    onChangeText={text => this.setTextInput(text)}
                    ref={input => this.postTextInput = input}
                    style={styles.createPostContainer} />

                <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handlePostButtonClick()}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
                        <Text style={styles.buttonLabelName}>{'Post'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View >
        )
    }
} 