import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { SafeAreaView } from "react-navigation";
import ProfileComponent from "../../components/profileComponent/profileComponent";
import ProfileSongs from "../../components/profileSongs/profileSongs";
import ProfilePosts from "../../components/profilePosts/profilePosts";

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 1,

    }
  }

  handleSongsClick() {
    this.setState({ activeTab: 1 })
  }

  handlePostsClick() {
    this.setState({ activeTab: 2 })
  }

  render() {
    return (
      <SafeAreaView forceInset={{ bottom: 'never'}} style={{'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{'backgroundColor': '#1B1E23', 'flex': 1 }}>
          <HeaderComponent navigation={this.props.navigation}/>
          <View style={styles.profileTabs}>
            <View style={styles.profileSongTab}>
              {this.state.activeTab=== 1 && <View style={styles.activeTab} />}
              <TouchableOpacity style={styles.tabClick} onPress={() => this.handleSongsClick()}>
                <Text style={styles.tabTitleText}>{'Songs'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profilePostTab}>
              {this.state.activeTab=== 2 && <View style={styles.activeTab} />}
              <TouchableOpacity style={styles.tabClick} onPress={() => this.handlePostsClick()}>
                <Text style={styles.tabTitleText}>{'Posts'}</Text>
              </TouchableOpacity>
            </View>
          </View>
            {this.state.activeTab === 1 ?
            <ProfileSongs accessToken={this.props.token} username={this.props.username} />
            : <ProfilePosts accessToken={this.props.token} username={this.props.username} />
            }
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
    username: state.home.username,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);