import React, { Component } from "react";
import { View, TouchableOpacity, Alert, Text, TextInput, Platform } from 'react-native';
import GLOBALS from '../../utils/globalStrings';
import styles from './styles';
import LinearGradient from "react-native-linear-gradient";
import { createUserPost } from "../../api/usersAPI";

export default class CreatePostComponent extends Component {

    constructor(props) {
        super(props)

        this.state = {
            postMessage: ''
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }

    showAlert(title, text, action) {
        Alert.alert(
          title,
          text,
          [
            { text: 'OK', onPress: action },
          ],
          { cancelable: false },
        );
      }

    setTextInput(text) {
        this.setState({ postMessage: text})
    }

    handlePostButtonClick() {
        createUserPost(this.state.postMessage, this.props.accessToken).then(response => {
            if (response.message === 'Message posted.') {
                this.showAlert('Post created')
            } else {
                this.showAlert('Error', 'ops')
            }
        })
    }

    render() {
        return (
            <View style={[this.props.style, styles.container]} >
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
                    ref={input => this.textInput = input}
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