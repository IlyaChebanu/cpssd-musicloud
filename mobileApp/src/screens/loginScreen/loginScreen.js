import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { loginUser } from "../../api/usersAPI";
import { writeDataToStorage, TOKEN_DATA_KEY } from "../../utils/localStorage";
import { getInvalidLoginDetails } from "../../utils/helpers";
// import { loginUser } from "../../api/usersAPI";

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    }
  }

  showAlert() {
    Alert.alert(
      'Error',
      'Invalid Credentials',
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  }

  saveLoginDetails(token) {
    this.props.setAuthToken(token)
    writeDataToStorage(token, TOKEN_DATA_KEY)
  }

  handleLoginClick() {
    let invalidFields = getInvalidLoginDetails(this.state.username.trim(), this.state.password)
    if (invalidFields.length == 0) {
      loginUser(this.state.username, this.state.password).then(response => {
        if (response.access_token) {
          this.saveLoginDetails(response.access_token)
          this.props.navigateToHomeScreen()
        } else {
          this.showAlert()
        }
      })
    } else {
      this.showAlert()
    }
  }

  handleForgotClick() {
    // loginUser('Herman', 'SecurePassword')
  }

  handleBackClick() {
    this.props.navigateBack()
  }

  setUserTextInput(text) {
    this.setState({ username: text})
  }

  setPasswordTextInput(text) {
    this.setState({ password: text})
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
          setText={this.setUserTextInput.bind(this)}
          style={{"marginBottom": 1}}
          labelName={"Username"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          setText={this.setPasswordTextInput.bind(this)}
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
    token: state.home.token,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);