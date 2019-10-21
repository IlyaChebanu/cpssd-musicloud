import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { loginUser, reVerifyEmail } from "../../api/usersAPI";
import { writeDataToStorage, TOKEN_DATA_KEY } from "../../utils/localStorage";
import { getInvalidLoginDetails } from "../../utils/helpers";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PasswordInput from "../../components/passwordInput/passwordInput";
// import { loginUser } from "../../api/usersAPI";

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      maskPassword: true,
    }
  }

  componentDidMount() {
    if (this.props.newAccount) {
      Alert.alert(
        'Account Created',
        'Verify the email first before login',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false },
      );
    }
  }

  showAlert(text) {
    Alert.alert(
      'Error',
      text,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  reverifyAlert() {
    Alert.alert(
      'Verication email resent',
      'Verification email sent to: ' + this.props.email,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
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
          this.props.setNewAccount(false)
          this.props.navigateToHomeScreen()
        } else {
          this.showAlert('Invalid Credentials')
        }
      })
    } else {
      this.showAlert("Invalid: " + invalidFields.join(', '))
    }
  }

  handleVerifyClick() {
    reVerifyEmail(this.props.email).then(response => {
      if (response.message == "Verification email sent.") {
        this.reverifyAlert()
      } else {
        this.showAlert('Failed to resent verification email')
      }
    })
  }

  handleForgotClick() {
    // loginUser('Herman', 'SecurePassword')
  }

  handleBackClick() {
    this.props.navigateBack()
    this.props.setNewAccount(false)
  }

  setUserTextInput(text) {
    this.setState({ username: text })
  }

  setPasswordTextInput(text) {
    this.setState({ password: text })
  }

  togglePasswordMask() {
    this.setState({ maskPassword: !this.state.maskPassword });
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
              <Image style={styles.arrowback} source={arrowback} />
            </TouchableOpacity>
            <Image style={styles.logo} source={logoImage} />
          </View>
          {this.props.newAccount ?
            <View style={styles.verifyContainer}>
              <Text style={styles.verifyText}>{"Did not receive email? "}
                <Text onPress={() => this.handleVerifyClick()} style={styles.verifyLink}>{"Click here"}</Text>
                {" to resend it."}</Text>
            </View>
            : null}
          <LoginInput
            ref={ref => (this.loginInputName = ref)}
            setText={this.setUserTextInput.bind(this)}
            style={{ "marginBottom": 1 }}
            labelName={"Username"} />
          <PasswordInput
            ref={ref => (this.loginInputName = ref)}
            togglePassword={this.togglePasswordMask.bind(this)}
            maskPassword={this.state.maskPassword}
            setText={this.setPasswordTextInput.bind(this)}
            labelName={"Password"} />

          <TouchableOpacity style={styles.forgotButton} onPress={() => this.handleForgotClick()}>
            <Text style={styles.forgotText}>{'Forgot Password?'}</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>

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
    newAccount: state.reg.newAccount,
    email: state.reg.email,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);