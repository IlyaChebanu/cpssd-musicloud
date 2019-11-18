import React, { Component } from "react";
import { View, ActivityIndicator } from 'react-native';
import styles from './styles';

export default class Spinner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            colour: props.colour,
        };
    }

    render() {
        return (
            <View pointerEvents="none" style={styles.activityIndicator}>
                <ActivityIndicator size='large' color={this.state.colour} />
            </View>
        )
    }
}