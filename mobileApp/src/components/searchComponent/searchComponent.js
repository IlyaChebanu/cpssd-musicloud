import React from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";

export default class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          selectedSort: 0,
          sortOrder: 0,
        };
    }
    
    setTextInput(text) {
        this.setState({ inputText: text});
        this.props.handleTyping(text)
    }

    handleSortClick(sortnum) {
        if(this.state.selectedSort !== sortnum) {
            this.setState({ selectedSort: sortnum, sortOrder: 1 })
            this.props.handleSorting(sortnum, 1)
        } else if (this.state.sortOrder === 1) {
            this.setState({ sortOrder: 2 })
            this.props.handleSorting(sortnum, 2)
        } else if (this.state.sortOrder === 2) {
            this.setState({ sortOrder: 0 })
            this.props.handleSorting(sortnum, 0)
        } else {
            this.setState({ sortOrder: 1 })
            this.props.handleSorting(sortnum, 1)
        }
    }

    getSortImage(sortnum) {
        let sortImageNone = require('../../assets/images/sortnone.png')
        let sortImageUp = require('../../assets/images/sortup.png')
        let sortImageDown = require('../../assets/images/sortdown.png')
        if (this.state.selectedSort === sortnum) {
            if (this.state.sortOrder === 1) {
                return sortImageDown
            } else if (this.state.sortOrder === 2) {
                return sortImageUp
            } else {
                return sortImageNone
            }
        }
        return sortImageNone
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
                        placeholderTextColor="white"
                        underlineColorAndroid='rgba(0,0,0,0)'
                        keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
                        onChangeText={text => this.setTextInput(text)}
                        ref={input => this.textInput = input}
                        style={styles.searchInput} />
                </View>
                <View style={styles.sortContainer}>
                    <TouchableOpacity onPress={() => this.handleSortClick(1)} style={styles.sortButton}>
                        <Text style={styles.sortText}>{'Time Published'}</Text>
                        <Image style={styles.sortImage} source={this.getSortImage(1)}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleSortClick(2)} style={styles.sortButton}>
                        <Text style={styles.sortText}>{'Title'}</Text>
                        <Image style={styles.sortImage} source={this.getSortImage(2)}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleSortClick(3)} style={styles.sortButton}>
                        <Text style={styles.sortText}>{'Artist'}</Text>
                        <Image style={styles.sortImage} source={this.getSortImage(3)}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.handleSortClick(4)} style={styles.sortButton}>
                        <Text style={styles.sortText}>{'Duration'}</Text>
                        <Image style={styles.sortImage} source={this.getSortImage(4)}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
