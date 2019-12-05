import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import styles from "./styles";
import { getFollowing, followUser, unfollowUser } from "../../api/usersAPI";
import LinearGradient from "react-native-linear-gradient";

export default class FollowingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            followingData: [],
            following: true,
        }
    }

    componentDidMount() {
        this.getFollowing()
    }

    getFollowing() {
        getFollowing(this.props.username, this.props.accessToken).then(response => {
            this.setState({ followingData: response.data.following })
        })
    }

    handleFollowClick() {
        followUser(this.props.token, this.props.otherUserData.username).then(response => {
            if (response.status === 200) {
                this.setState({ following: true })
            }
        })
    }

    handleUnFollowClick() {
        unfollowUser(this.props.token, this.props.otherUserData.username).then(response => {
            if (response.status === 200) {
                this.setState({ following: false })
            }
        })
    }

    renderFollowing({ item, index }) {
        let profilePic = item.profiler
        let profilePicPlaceholder = require('../../assets/images/profilePlaceholder.png')
        let username = item.username
        let isFollowing = this.state.following//item.follow_back
        return (
            <View style={styles.followingContainer}>
                {profilePic ? <Image style={styles.profileImg} source={{ uri: profilePic }} /> :
                    <Image style={styles.profileImg} source={profilePicPlaceholder} />}
                <Text style={styles.nameText}>{username}</Text>
                {!isFollowing ?
                    <TouchableOpacity style={styles.followingButton} onPress={() => this.handleFollowClick}>
                        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
                            <Text style={styles.followText}>{'Follow'}</Text>
                        </LinearGradient>
                    </TouchableOpacity> :
                    <TouchableOpacity style={styles.followingButton} onPress={() => this.handleUnFollowClick}>
                        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#FF0265', '#E78D35']} style={styles.button}>
                            <Text style={styles.followText}>{'Following ✓'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>}
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.followingData.length ? <FlatList
                    style={styles.followingFlatList}
                    data={this.state.followingData}
                    renderItem={this.renderFollowing.bind(this)}
                    keyExtractor={item => String(item.username)}
                    extraData={this.state.followingData}
                /> :
                    <Text style={styles.defaultText}>{'You are not following anyone'}</Text>}
            </View>
        )
    }
}