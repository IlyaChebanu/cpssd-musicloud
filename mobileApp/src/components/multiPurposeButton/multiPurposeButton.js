import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

export default class MultiPurposeButton extends Component {

    constructor(props) {
        super(props)

        this.state = {
            buttonName: props.buttonName,
            buttonDisbaled: props.buttonDisbaled,
            style: props.style,
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {
        if (prevProps.style != this.props.style) {
            this.setState({ style: this.props.style})
        }
        if (prevProps.buttonDisbaled != this.props.buttonDisbaled) {
            this.setState({ buttonDisbaled: this.props.buttonDisbaled})
        }
    }

    handleButtonClick() {
        this.props.handleButtonClick()
    }

    render() {
        return (
            <Animated.View style={this.state.style}>
                <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handleButtonClick()}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
                        <Text style={styles.buttonLabelName}>{this.state.buttonName}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        )
    }
}
