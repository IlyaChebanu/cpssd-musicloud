import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, TextInput, Platform } from 'react-native';
import GLOBALS from '../../utils/globalStrings';
import styles from './styles';

export default class PasswordInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            labelName: props.labelName,
            inputText: '',
            style: props.style,
            maskPassword: props.maskPassword,
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {
        if (prevProps.maskPassword != this.props.maskPassword) {
            this.setState({ maskPassword: this.props.maskPassword })
        }
    }

    togglePassword() {
        this.props.togglePassword()
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
        let visibleImg = this.state.maskPassword ? require("../../assets/images/visibility.png") : require("../../assets/images/visibility_off.png")
        return (
            <View style={[this.props.style, styles.container]} >
                <TouchableOpacity activeOpacity={1} onPress={() => this.handleInputClick()}>
                    <View style={styles.subContainer} >
                        <Text style={styles.loginLabelName}>{this.state.labelName}</Text>
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            spellCheck={false}
                            secureTextEntry={this.state.maskPassword}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                            onChangeText={text => this.setTextInput(text)}
                            ref={input => this.textInput = input}
                            style={styles.loginTextInput} />
                    </View >

                    <TouchableOpacity style={styles.imageContainer} onPress={() => this.togglePassword()}>
                        <Image source={visibleImg} style={styles.visImg} />
                    </TouchableOpacity >

                </TouchableOpacity>
            </View >
        )
    }
} 