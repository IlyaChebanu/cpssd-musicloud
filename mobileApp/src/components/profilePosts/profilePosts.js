import React from "react"
import { StyleSheet, Text, View, Image, FlatList, TextInput } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import postsData from "./samplePostData";
import MultiPurposeButton from "../multiPurposeButton/multiPurposeButton";
import ProfileComponent from "../profileComponent/profileComponent";
import CreatePostComponent from "../createPostComponent/createPostComponent";

export default class DummyScreen extends React.Component {

  setTextInput(text) {
    this.setState({ inputText: text });
  }

  renderheader() {
    return (
      <View style={styles.container}>
        <Text style={styles.profileTitleText}>{"PROFILE"}</Text>
        <ProfileComponent />
        <Text style={styles.titleText}>{"Posts"}</Text>
        <CreatePostComponent />
      </View>
    )
  }

  renderPost({ item, index }) {
    let postText = item.text
    let postLikes = item.likes
    let postTimeAgo = item.timeAgo
    let likeImg = require('../../assets/images/like.png')
    return (
      <View style={styles.postContainer}>
        <Text style={styles.postText}>{postText}</Text>
        <Text style={styles.timeAgo}>{postTimeAgo}</Text>
        <View style={styles.likeContainer}>
          <Text style={styles.likes}>{postLikes}</Text><Image source={likeImg} />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {/* <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize={'none'}
            autoCorrect={false}
            spellCheck={false}
            placeholder="Write something..."
            placeholderTextColor="white"
            underlineColorAndroid='rgba(0,0,0,0)'
            keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
            onChangeText={text => this.setTextInput(text)}
            ref={input => this.textInput = input}
            style={styles.createPost} />
          <View style={styles.postButton}>
          </View>
        </View> */}
        <FlatList 
          ListHeaderComponent={this.renderheader()}
          style={styles.postFlatList}
          data={postsData}
          renderItem={this.renderPost.bind(this)}
          keyExtractor={item => String(item.id)}
          extraData={postsData}
        />
      </View>
    )
  }
}