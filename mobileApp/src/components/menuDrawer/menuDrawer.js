import React from "react"
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Dimensions, Platform, TouchableOpacity } from "react-native"
import styles from "./styles";
import { SafeAreaView, NavigationActions } from "react-navigation";
import { clearAllStorage } from "../../utils/localStorage";
import * as screenNames from "../../navigation/screenNames";
import { logoutUser } from "../../api/usersAPI";

class MenuDrawer extends React.Component {

  async handleLogoutClick() {
    // logoutUser(token)
    await clearAllStorage()
    // this.props.clearReduxState()
    const navigateAction = NavigationActions.navigate({
      routeName: screenNames.START_SCREEN,
      type: 'PopStack',
    })
    this.props.navigation.dispatch(navigateAction);
  }

  handleNavigation(nav) {
        this.props.navigation.navigate(nav)
        this.props.navigation.closeDrawer()
  }
  
  navLink(nav, text) {
      return (
          <TouchableOpacity style={styles.linkButton} onPress={() => this.handleNavigation(nav)}>
              <View style={styles.borderLeft}></View><Text style={styles.linkText}>{text}</Text>
          </TouchableOpacity>
      )
  }

  render() {
    return (
      <SafeAreaView style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
        <View style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
            <View style={styles.linkContainer}>
                {this.navLink('Home', 'Discover')}
                {this.navLink('Profile', 'Profile')}
            </View>
            <View style={styles.logoutContainer}>
              <TouchableOpacity style={styles.logoutClick} onPress={() => this.handleLogoutClick()}>
                <Text style={styles.logoutText}>{"LOGOUT"}</Text>
              </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state) {
  return {

  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuDrawer);