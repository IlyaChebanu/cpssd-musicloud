import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import { TextInput } from "react-native-gesture-handler";

export default class SearchComponent extends React.Component {
    setTextInput(text) {
        this.setState({ inputText: text });
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.searchText}>{"Search"}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        spellCheck={false}
                        underlineColorAndroid='rgba(0,0,0,0)'
                        keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                        onChangeText={text => this.setTextInput(text)}
                        ref={input => this.textInput = input}
                        style={styles.searchInput} />
                </View>
            </View>
        )
    }
}