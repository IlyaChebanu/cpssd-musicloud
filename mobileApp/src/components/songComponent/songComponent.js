import React from 'react';

import { Text, View, Image, TouchableOpacity } from "react-native";
import styles from "./styles";

class SongComponent extends React.Component {

    handleSongClick() {
        this.props.handleSongClicked(this.props.item, this.props.index)
    }

    handleLikeClick() {
        this.props.handleLikeClicked(this.props.item, this.props.index)
    }

    render () {
        let item = this.props.item
        let index = this.props.index
        let songName = item.title
        let authorName = item.username
        let songImage = item.cover
        let likedSong = item.like_status
        let playImage = require('../../assets/images/play.png')
        let songLikes = item.likes
        let likeImg = require('../../assets/images/like.png')
        let likedImg = require('../../assets/images/like_color.png')
        let placeholderImg = require('../../assets/images/cloud.png')
        return(
            <View>
                <TouchableOpacity style={styles.songContainer} onPress={() => this.handleSongClick()}>
                    {songImage ? <Image style={styles.songImage} source={{ uri: songImage }} /> : <Image style={styles.songImage} source={placeholderImg} />}
                    <Image style={styles.playImage} source={playImage} />
                    <View style={styles.songDetailsContainer}>
                        <Text style={styles.songNameText}>{songName}</Text>
                        <Text style={styles.authorNameText}>{authorName}</Text>
                        <TouchableOpacity style={styles.heartlike} onPress={() => this.handleLikeClick(item, index)}>
                            {likedSong ?
                                <View style={styles.likeContainer}>
                                    <Text style={styles.likedText}>{songLikes}</Text><Image style={styles.likeImg} source={likedImg} />
                                </View> :
                                <View style={styles.likeContainer}>
                                    <Text style={styles.likes}>{songLikes}</Text><Image style={styles.likeImg} source={likeImg} />
                                </View>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

export default SongComponent