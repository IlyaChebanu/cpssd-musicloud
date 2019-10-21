import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { getInvalidRegisterDetails } from "../../utils/helpers";
import { registerUser } from "../../api/usersAPI";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      username: '',
      password: '',
      passwordRepeat: '',
    }
  }

  showAlert(text) {
    Alert.alert(
      'Error',
      text,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  }

  handleRegisterClick() {
    let invalidFields = getInvalidRegisterDetails(this.state.username.trim(), this.state.email.trim(), this.state.password, this.state.passwordRepeat)
    if (invalidFields.length === 0) {
      registerUser(this.state.username.trim(), this.state.email.trim(), this.state.password).then(response => {
        if (response.message == "User created!") {
          this.props.setEmail(this.state.email.trim())
          this.props.setNewAccount(true)
          this.props.navigateToLoginScreen()
        } else {
          this.showAlert('User Already Exists')
        }
      })
    } else {
      this.showAlert("Invalid: " + invalidFields.join(', '))
    }
  }

  handleForgotClick() {
    
  }

  handleBackClick() {
    this.props.navigateBack()
  }

  setEmailTextInput(text) {
    this.setState({ email: text});
  }

  setUsernameTextInput(text) {
    this.setState({ username: text});
  }

  setPasswordTextInput(text) {
    this.setState({ password: text});
  }

  setPasswordRepeatTextInput(text) {
    this.setState({ passwordRepeat: text});
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView>
        {/* <Text style={styles.mandatoryErrorText}>{GLOBALS.DUMMY_SCREEN_TITLE}</Text> */}

        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={() => this.handleBackClick()}>
            <Image style={styles.arrowback} source={arrowback}/>
          </TouchableOpacity>
          <Image style={styles.logo} source={logoImage}/>
        </View>
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          setText={this.setEmailTextInput.bind(this)}
          style={{"marginBottom": 1}}
          labelName={"Email"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          setText={this.setUsernameTextInput.bind(this)}
          style={{"marginBottom": 1}}
          labelName={"Username"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          setText={this.setPasswordTextInput.bind(this)}
          style={{"marginBottom": 1}}
          labelName={"Password"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          setText={this.setPasswordRepeatTextInput.bind(this)}
          labelName={"Repeat Password"} />
        </KeyboardAwareScrollView>
        
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