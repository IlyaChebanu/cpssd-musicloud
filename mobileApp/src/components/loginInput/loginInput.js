import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, TextInput, Platform, Animated } from 'react-native';
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
        if (prevProps.style != this.props.style) {
            this.setState({ style: this.props.style })
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

    clearText() {
        this.textInput.clear()
    }

    clearFocus() {
        this.textInput.blur()
    }

    render() {
        return (
            <Animated.View style={[this.state.style, styles.container, !this.state.editable && styles.disabledContainer]} >
                <TouchableOpacity activeOpacity={1} onPress={() => this.handleInputClick()}>
                    <View style={styles.subContainer} >
                        <Text style={this.state.editable ? styles.loginLabelName : styles.disableLabelName}>{this.state.labelName}</Text>
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
                            style={styles.loginTextInput} />
                    </View >
                </TouchableOpacity>
            </Animated.View >
        )
    }
} 