import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import styles from "./styles";
import { getFollowing, followUser, unfollowUser } from "../../api/usersAPI";
import LinearGradient from "react-native-linear-gradient";

export default class UserFollowingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            followingData: [],
            followingPairs: {},
            nextPage: null,
        }
    }

    componentDidMount() {
        this.getFollowing()
    }

    getFollowing() {
        getFollowing(this.props.username, this.props.accessToken, 20, this.state.nextPage).then(response => {
            let followersData = response.data.following
            let obj = {}
            for (var i = 0; i < followersData.length; i++) {
                obj[followersData[i].username] = 1
            }

            let joinedObj = { ...this.state.followingPairs, ...obj}
            var joined = this.state.followingData.concat(followersData)
            this.setState({ followingData: joined, nextPage: response.data.next_page, followingPairs: joinedObj })
        })
    }

    _handleLoadMore() {
        if (this.state.nextPage !== null){
          this.getFollowing()
        }
    }

    handleFollowClick(item) {
        followUser(this.props.accessToken, item.username).then(response => {
            if (response.status === 200) {
                this.setState(prevState => ({
                    followingPairs: {
                        ...prevState.followingPairs,
                        [item.username]: 1
                    }
                }))
            }
        })
    }

    handleUnFollowClick(item) {
        unfollowUser(this.props.accessToken, item.username).then(response => {
            if (response.status === 200) {
                this.setState(prevState => ({
                    followingPairs: {
                        ...prevState.followingPairs,
                        [item.username]: 0
                    }
                }))
            }
        })
    }

    renderFollowing({ item, index }) {
        let profilePic = item.profiler
        let profilePicPlaceholder = require('../../assets/images/profilePlaceholder.png')
        let username = item.username
        let isFollowing = this.state.followingPairs ? this.state.followingPairs[item.username] : item.follow_back
        return (
            <View style={styles.followingContainer}>
                {profilePic ? <Image style={styles.profileImg} source={{ uri: profilePic }} /> :
                    <Image style={styles.profileImg} source={profilePicPlaceholder} />}
                <Text style={styles.nameText}>{username}</Text>
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
                    onEndReached={this._handleLoadMore.bind(this)}
                    onEndReachedThreshold={0.5}
                /> :
                    <Text style={styles.defaultText}>{'You are not following anyone'}</Text>}
            </View>
        )
    }
}