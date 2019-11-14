import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { readStorageData, TOKEN_DATA_KEY, USERNAME_DATA_KEY } from "../../utils/localStorage";

class StartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.loadCorrectFlow()
    this.state = {
      
    };
  }

  async loadCorrectFlow() {
    let token = await readStorageData(TOKEN_DATA_KEY)
    let username = await readStorageData(USERNAME_DATA_KEY)
    if (token != null) {
      this.props.setAuthToken(token)
      this.props.setUsername(username)
      this.props.navigateToHomeScreen()
    } else {

    }
  }

  handleSignInClick() {
    this.props.navigateToLoginScreen()
  }

  handleCreateClick() {
    this.props.navigateToRegisterScreen()
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    var topVector = require("../../assets/images/topVector.png");
    var bottomVector = require("../../assets/images/bottomVector.png");
    return (
      <View style={{ 'paddingTop': 70, 'backgroundColor': '#1B1E23', 'flex': 1 }}>
        <Image style={styles.topVector} source={topVector} />
        {/* <Text style={styles.mandatoryErrorText}>{GLOBALS.DUMMY_SCREEN_TITLE}</Text> */}
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={logoImage}/>
        </View>

        <MultiPurposeButton 
          handleButtonClick={this.handleCreateClick.bind(this)}
          style={styles.createButton}
          buttonName={"Create Account"}
        />
        <MultiPurposeButton 
          handleButtonClick={this.handleSignInClick.bind(this)}
          style={styles.signInButton}
          buttonName={"Sign in"}
        />
        <Image style={styles.bottomVector}source={bottomVector} />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    token: state.home.token,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);