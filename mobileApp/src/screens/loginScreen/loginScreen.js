import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
// import { loginUser } from "../../api/usersAPI";

class LoginScreen extends React.Component {

  handleLoginClick() {
    this.props.navigateToHomeScreen()
  }

  handleForgotClick() {
    // loginUser('Herman', 'SecurePassword')
  }

  handleBackClick() {
    this.props.navigateBack()
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    return (
      <View style={{ 'paddingTop': 70, 'backgroundColor': '#1B1E23', 'flex': 1 }}>
        {/* <Text style={styles.mandatoryErrorText}>{GLOBALS.DUMMY_SCREEN_TITLE}</Text> */}

        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={() => this.handleBackClick()}>
            <Image style={styles.arrowback} source={arrowback}/>
          </TouchableOpacity>
          <Image style={styles.logo} source={logoImage}/>
        </View>
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          style={{"marginBottom": 1}}
          labelName={"Email"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          labelName={"Password"} />

        <TouchableOpacity style={styles.forgotButton} onPress={() => this.handleForgotClick()}>
          <Text style={styles.forgotText}>{'Forgot Password?'}</Text>
        </TouchableOpacity>

        <MultiPurposeButton 
          handleButtonClick={this.handleLoginClick.bind(this)}
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);