import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, TextInput, Platform } from 'react-native'
import GLOBALS from '../../utils/globalStrings';
import styles from './styles';

export default class LoginInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            labelName: props.labelName,
            inputText: '',
            style: props.style,
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }

    setTextInput(text) {
        this.setState({ inputText: text });
    }

    getTextInput() {
        return this.state.inputText
    }

    handleInputClick() {
        this.textInput.focus()
    }

    focus() {
        this.textInput.focus()
    }

    render() {
        return (
            <View style={[this.props.style, styles.container]} >
                <TouchableOpacity activeOpacity={1} onPress={() => this.handleInputClick()}>
                <View style={styles.subContainer} >
                    <Text style={styles.loginLabelName}>{this.state.labelName}</Text>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        spellCheck={false}
                        underlineColorAndroid='rgba(0,0,0,0)'
                        keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                        onChangeText={text => this.setTextInput(text)}
                        ref={input => this.textInput = input}
                        style={styles.loginTextInput} />
                </View >
                </TouchableOpacity>
            </View >
        )
    }
} 