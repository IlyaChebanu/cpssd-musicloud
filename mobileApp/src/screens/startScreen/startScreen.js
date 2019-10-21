import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { TouchableOpacity } from "react-native-gesture-handler";

class StartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
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
    return (
      <View style={{ 'paddingTop': 70, 'backgroundColor': '#1B1E23', 'flex': 1 }}>
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
      </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);