import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, TextInput, Platform } from 'react-native';
import GLOBALS from '../../utils/globalStrings';
import styles from './styles';

export default class LoginInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            labelName: props.labelName,
            inputText: '',
            style: props.style,
            editable: props.editable && props.editable,
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {
        if (prevProps.editable != this.props.editable) {
            this.setState({ editable: this.props.editable })
        }
    }

    setTextInput(text) {
        this.setState({ inputText: text });
        this.props.setText(text)
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
            <View style={[this.props.style, styles.container, !this.state.editable && styles.disabledContainer]} >
                <TouchableOpacity activeOpacity={1} onPress={() => this.handleInputClick()}>
                <View style={styles.subContainer} >
                    <Text style={this.state.editable ? styles.loginLabelName : styles.disableLabelName}>{this.state.labelName}</Text>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        spellCheck={false}
                        editable={this.state.editable}
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