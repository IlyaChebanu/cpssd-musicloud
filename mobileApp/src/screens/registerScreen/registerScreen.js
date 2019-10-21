import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";

class RegisterScreen extends React.Component {

  handleRegisterClick() {
    this.props.navigateToHomeScreen()
  }

  handleForgotClick() {
    
  }

  handleBackClick() {
    this.props.navigateBack()
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    return (
      <View style={styles.container}>
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
          style={{"marginBottom": 1}}
          labelName={"Username"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          style={{"marginBottom": 1}}
          labelName={"Password"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          labelName={"Repeat Password"} />

        <MultiPurposeButton 
          handleButtonClick={this.handleRegisterClick.bind(this)}
          style={styles.signInButton}
          buttonName={"Create Account"}
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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);