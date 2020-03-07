import React, { memo, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";

const SearchComponent = memo(({
    text
}) => {
    const [textInput, setTextInput] = useState('');
        return (
            <View style={styles.container}>
                <Text style={styles.searchText}>{"Search"}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        spellCheck={false}
                        placeholderTextColor="white"
                        underlineColorAndroid='rgba(0,0,0,0)'
                        keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                        onChangeText={text => setTextInput(text)}
                        ref={input => this.textInput = input}
                        style={styles.searchInput} />
                </View>
            </View>
        )
})

export default SearchComponent