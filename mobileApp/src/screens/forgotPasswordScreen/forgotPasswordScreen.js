import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import PasswordInput from "../../components/passwordInput/passwordInput";
import { passwordResetInitialize, passwordResetConfirm } from "../../api/usersAPI";

const STATE_LOGIN_RESET_INITIAL = 1;
const STATE_LOGIN_RESET_FINISH = 2;

class ForgotPasswordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      code: '',
      password: '',
      passwordRepeat: '',
      maskPassword: true,
      maskPasswordRepeat: true,
      screenState: [STATE_LOGIN_RESET_INITIAL],
    }
  }

  showAlert(title, text, action) {
    Alert.alert(
      title,
      text,
      [
        { text: 'OK', onPress: action },
      ],
      { cancelable: false },
    );
  }

  handleBackClick() {
    this.props.navigateBack()
    this.props.setNewAccount(false)
  }

  handleResetOkClick = () => {
    this.props.navigateBack()
  }

  handleResetClick() {
    passwordResetInitialize(this.state.email).then(response => {
      if (response.message === 'Email sent.') {
        this.showAlert('Email Sent', `Please check your email: ${this.state.email} for verification code`)
        this.setState({ screenState: [STATE_LOGIN_RESET_FINISH] })
      } else {
        this.showAlert('Error', 'A result could not be found.')
      }
    })
  }

  handleConfirmResetClick() {
    passwordResetConfirm(this.state.email, Number(this.state.code), this.state.password).then(response => {
      if (response.message) {
        this.showAlert('Password Sucessfully reset', 'Password succesfully reset. Press Ok to log in.', this.handleResetOkClick)
      } else {
        this.showAlert('Error', 'A result could not be found.')
      }
    })
  }

  setEmailTextInput(text) {
    this.setState({ email: text })
  }

  setCodeTextInput(text) {
    this.setState({ code: text })
  }

  togglePasswordMask() {
    this.setState({ maskPassword: !this.state.maskPassword });
  }

  togglePasswordRepeatMask() {
    this.setState({ maskPasswordRepeat: !this.state.maskPasswordRepeat });
  }

  setPasswordTextInput(text) {
    this.setState({ password: text })
  }

  setPasswordRepeatTextInput(text) {
    this.setState({ passwordRepeat: text })
  }

  renderPasswordResetInitial() {
    return (
      <LoginInput
            ref={ref => (this.emailInputName = ref)}
            setText={this.setEmailTextInput.bind(this)}
            style={{ "marginBottom": 1 }}
            labelName={"Email"} />
    )
  }

  renderPasswordResetFinal() {
    return (
      <View>
        <LoginInput
              ref={ref => (this.codeInputName = ref)}
              setText={this.setCodeTextInput.bind(this)}
              style={{ "marginBottom": 1 }}
              labelName={"Code"} />
        <PasswordInput
            ref={ref => (this.passwordInputName = ref)}
            togglePassword={this.togglePasswordMask.bind(this)}
            maskPassword={this.state.maskPassword}
            style={{ "marginBottom": 1 }}
            setText={this.setPasswordTextInput.bind(this)}
            labelName={"New Password"} />
        <PasswordInput
            ref={ref => (this.passwordRepeatInputName = ref)}
            togglePassword={this.togglePasswordRepeatMask.bind(this)}
            maskPassword={this.state.maskPasswordRepeat}
            setText={this.setPasswordRepeatTextInput.bind(this)}
            labelName={"Repeat New Password"} />
      </View>
    )
  }

  render() {
    var logoImage = require("../../assets/images/logo.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    var topVector = require("../../assets/images/topVector.png");
    var bottomVector = require("../../assets/images/bottomVector.png");
    return (
      <View style={styles.container}>
        <Image style={styles.topVector} source={topVector} />
        <KeyboardAwareScrollView>

          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={() => this.handleBackClick()}>
              <Image style={styles.arrowback} source={arrowback} />
            </TouchableOpacity>
            <Image style={styles.logo} source={logoImage} />
          </View>

          {this.state.screenState.includes(STATE_LOGIN_RESET_INITIAL) ? this.renderPasswordResetInitial() : null}
          {this.state.screenState.includes(STATE_LOGIN_RESET_FINISH) ? this.renderPasswordResetFinal() : null}

        </KeyboardAwareScrollView>
        <Image style={styles.bottomVector}source={bottomVector} />
        <MultiPurposeButton
          handleButtonClick={this.state.screenState.includes(STATE_LOGIN_RESET_INITIAL) ? this.handleResetClick.bind(this) : this.handleConfirmResetClick.bind(this)}
          style={styles.resetButton}
          buttonName={"Reset Password"}
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    newAccount: state.reg.newAccount,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordScreen);
