import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Easing, Dimensions, BackHandler } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import { writeDataToStorage, readStorageData, TOKEN_DATA_KEY, USERNAME_DATA_KEY, SETTINGS_PORTRAIT_DATA_KEY, SETTINGS_NOTIFICATION_DATA_KEY, SETTINGS_NOTIFICATION_FOLLOW_DATA_KEY, SETTINGS_NOTIFICATION_POST_DATA_KEY, SETTINGS_NOTIFICATION_SONG_DATA_KEY, SETTINGS_NOTIFICATION_LIKE_DATA_KEY } from "../../utils/localStorage";
import Orientation from 'react-native-orientation';
import { animateTimingNative, animateCustomLoginNative, animateCustomRegisterNative, animateCustomForgotNative, animateTimingPromiseNative } from "../../utils/animate";
import LoginInput from "../../components/loginInput/loginInput";
import PasswordInput from "../../components/passwordInput/passwordInput";
import { getInvalidLoginDetails, getInvalidForgotPasswordDetails, getInvalidRegisterDetails } from "../../utils/helpers";
import { loginUser, passwordResetInitialize, passwordResetConfirm, registerUser, reVerifyEmail } from "../../api/usersAPI";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomAlertComponent from "../../components/alertComponent/customAlert";

const { width, height } = Dimensions.get('window');

const STATE_STARTUP = 1;
const STATE_LOGIN = 2;
const STATE_CREATE_ACCOUNT = 3;
const STATE_FORGOT_PASSWORD_INITIAL = 4;
const STATE_FORGOT_PASSWORD_FINISH = 5;

const loginArr = [0, 1];
const forgotArr = [0, 1, 2];
const regArr = [0, 1, 2, 3];

class StartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.loadCorrectFlow()
    // animated values
    this.animatedStartButtons = new Animated.Value(1)
    this.animatedTitle = new Animated.Value(0)
    this.animatedButtonLog = new Animated.Value(0)
    this.animatedButtonReg = new Animated.Value(0)
    this.animatedButtonForgot = new Animated.Value(0)
    this.animatedForgotInput = new Animated.Value(0)
    this.animatedLoginDetails = []
    this.animatedRegDetails = []
    this.animatedForgotDetails = []
    loginArr.forEach((value) => {
      this.animatedLoginDetails[value] = new Animated.Value(0)
    })
    regArr.forEach((value) => {
      this.animatedRegDetails[value] = new Animated.Value(0)
    })
    forgotArr.forEach((value) => {
      this.animatedForgotDetails[value] = new Animated.Value(0)
    })
    this.state = {
      screenState: [STATE_STARTUP],
      isPaused: false,
      //login screen
      usernameLogin: '',
      passwordLogin: '',
      maskPasswordLogin: true,
      //register screen
      emailReg: '',
      usernameReg: '',
      passwordReg: '',
      passwordRepeatReg: '',
      maskPasswordReg: true,
      maskPasswordRepeatReg: true,
      //forgot password screen
      email: '',
      code: '',
      password: '',
      passwordRepeat: '',
      maskPassword: true,
      maskPasswordRepeat: true,
      showAlert: false,
      alertTitle: '',
      alertMessage: '',
      alertState: 0,
      showExitAlert: false,
    };
  }

  async loadCorrectFlow() {
    let token = await readStorageData(TOKEN_DATA_KEY)
    let username = await readStorageData(USERNAME_DATA_KEY)
    let portraitMode = await readStorageData(SETTINGS_PORTRAIT_DATA_KEY)
    let notification = await readStorageData(SETTINGS_NOTIFICATION_DATA_KEY)
    let notificationFollow = await readStorageData(SETTINGS_NOTIFICATION_FOLLOW_DATA_KEY)
    let notificationPost = await readStorageData(SETTINGS_NOTIFICATION_POST_DATA_KEY)
    let notificationSong = await readStorageData(SETTINGS_NOTIFICATION_SONG_DATA_KEY)
    let notificationLike = await readStorageData(SETTINGS_NOTIFICATION_LIKE_DATA_KEY)
    if (portraitMode === false) {
      this.props.setIsPortrait(portraitMode)
      Orientation.unlockAllOrientations();
    } else if (portraitMode === true) {
      this.props.setIsPortrait(portraitMode)
    }
    if (notification === false || notification === true) {
      this.props.setIsNotification(notification)
    }
    if (notificationFollow === false || notificationFollow === true) {
      this.props.setIsNotificationFollow(notificationFollow)
    }
    if (notificationPost === false || notificationPost === true) {
      this.props.setIsNotificationPost(notificationPost)
    }
    if (notificationSong === false || notificationSong === true) {
      this.props.setIsNotificationSong(notificationSong)
    }
    if (notificationLike === false || notificationLike === true) {
      this.props.setIsNotificationLike(notificationLike)
    }
    if (token != null) {
      this.props.setAuthToken(token)
      this.props.setUsername(username)
      this.props.navigateToHomeScreen()
      animateTimingNative(this.animatedStartButtons, 0, 500, Easing.ease)
    } else {
      animateTimingNative(this.animatedStartButtons, 0, 500, Easing.ease)
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    if (this.state.screenState.includes(STATE_STARTUP)) {
      this.setState({ showExitAlert: true })
      return true;
    } else {
      this.handleBackClick(this.state.screenState)
      return true;
    }
  }

  // MAIN ANIMATIONS BUTTONS

  firstAnimation(value) {
    animateTimingNative(this.animatedStartButtons, value, 500, Easing.ease)
    animateTimingNative(this.animatedTitle, value, 500, Easing.ease)
  }

  handleSignInClick() {
    let screen = this.state.screenState
    if (screen.includes(STATE_STARTUP)) {
      animateTimingNative(this.animatedTitle, 1, 500, Easing.ease)
      animateTimingNative(this.animatedButtonReg, 1, 500, Easing.ease)
      this.setState({ screenState: [...this.state.screenState, STATE_LOGIN] });
      animateCustomLoginNative(this.animatedLoginDetails, loginArr, 1, 350, Easing.ease, 75).then(
        () => this.setState({ screenState: [STATE_LOGIN] })
      )
    } else {
      this.handleLoginClick()
    }
  }

  handleCreateClick() {
    let screen = this.state.screenState
    if (screen.includes(STATE_STARTUP)) {
      animateTimingNative(this.animatedTitle, 1, 500, Easing.ease)
      animateTimingNative(this.animatedButtonLog, 1, 500, Easing.ease)
      this.setState({ screenState: [...this.state.screenState, STATE_CREATE_ACCOUNT] });
      animateCustomRegisterNative(this.animatedRegDetails, regArr, 1, 350, Easing.ease, 75).then(
        () => this.setState({ screenState: [STATE_CREATE_ACCOUNT] })
      )
    } else {
      this.handleRegisterClick()
    }
  }

  handleBackClick(screen) {
    if (this.state.isPaused === false) {
      this.setState({ isPaused: true })
      if (screen.some(r => [STATE_LOGIN, STATE_CREATE_ACCOUNT].indexOf(r) >= 0)) {
        animateTimingNative(this.animatedTitle, 0, 500, Easing.ease)
        this.setState({ screenState: [...this.state.screenState, STATE_STARTUP] })
        if (screen.includes(STATE_LOGIN)) {
          animateTimingNative(this.animatedButtonReg, 0, 500, Easing.ease)
          let reverseLoginArray = loginArr.slice(0).reverse()
          animateCustomLoginNative(this.animatedLoginDetails, reverseLoginArray, 0, 350, Easing.ease, 75).then(
            () => {
              this.setState({ screenState: [STATE_STARTUP], isPaused: false })
              loginArr.forEach((value) => {
                this.animatedLoginDetails[value].setValue(0)
              })
            }
          )
        } else {
          animateTimingNative(this.animatedButtonLog, 0, 500, Easing.ease)
          let reverseArray = regArr.slice(0).reverse()
          animateCustomRegisterNative(this.animatedRegDetails, reverseArray, 0, 350, Easing.ease, 75).then(
            () => {
              regArr.forEach((value) => {
                this.animatedRegDetails[value].setValue(0)
              })
              this.setState({ screenState: [STATE_STARTUP], isPaused: false })
            })
        }
      } else if (screen.includes(STATE_FORGOT_PASSWORD_INITIAL)) {
        this.setState({ screenState: [...this.state.screenState, STATE_LOGIN] })
        animateTimingNative(this.animatedButtonForgot, 0, 500, Easing.ease)
        animateTimingNative(this.animatedButtonLog, 0, 500, Easing.ease)
        animateTimingPromiseNative(this.animatedForgotInput, 0, 350, Easing.ease, 75).then(
          () => this.animatedForgotInput.setValue(0)
        )
        let reverseLoginArray = loginArr.slice(0).reverse()
        animateCustomLoginNative(this.animatedLoginDetails, reverseLoginArray, 1, 350, Easing.ease, 75).then(
          () => this.setState({ screenState: [STATE_LOGIN], isPaused: false })
        )
      } else if (screen.includes(STATE_FORGOT_PASSWORD_FINISH)) {
        this.setState({ screenState: [...this.state.screenState, STATE_FORGOT_PASSWORD_INITIAL] })
        animateTimingNative(this.animatedForgotInput, 1, 350, Easing.ease, 150)
        let reverseForgotArr = forgotArr.slice(0).reverse()
        animateCustomForgotNative(this.animatedForgotDetails, reverseForgotArr, 0, 350, Easing.ease, 75).then(
          () => this.setState({ screenState: [STATE_FORGOT_PASSWORD_INITIAL], isPaused: false })
        )
      }
    }
    this.props.setNewAccount(false)
  }

  animateToLoginFromCreate() {
    this.setState({ screenState: [...this.state.screenState, STATE_LOGIN] })
    animateTimingNative(this.animatedButtonLog, 0, 500, Easing.ease)
    animateTimingNative(this.animatedButtonReg, 1, 500, Easing.ease)
    animateCustomRegisterNative(this.animatedRegDetails, regArr, 2, 350, Easing.ease, 75).then(
      () => {
        this.setState({ screenState: [STATE_LOGIN] })
        this.setState({ alertTitle: 'Account Succesfully Created', alertMessage: 'Account created with username: ' + this.state.usernameReg, showAlert: true })
      }
    )
    animateCustomLoginNative(this.animatedLoginDetails, loginArr, 1, 350, Easing.ease, 75)
  }

  animateToLogin() {
    this.setState({ screenState: [...this.state.screenState, STATE_LOGIN] })
    this.animatedForgotInput.setValue(0)
    animateTimingNative(this.animatedButtonForgot, 0, 500, Easing.ease)
    animateTimingNative(this.animatedButtonLog, 0, 500, Easing.ease)
    let reverseForgotArr = forgotArr.slice(0).reverse()
    animateCustomForgotNative(this.animatedForgotDetails, reverseForgotArr, 0, 350, Easing.ease, 75)
    this.setState({ screenState: [...this.state.screenState, STATE_LOGIN] });
    setTimeout(function () {
      animateCustomLoginNative(this.animatedLoginDetails, loginArr, 1, 350, Easing.ease, 75).then(
        () => this.setState({ screenState: [STATE_LOGIN] })
      )
    }.bind(this), 150)
  }

  handleForgotClick() {
    this.setState({ screenState: [...this.state.screenState, STATE_FORGOT_PASSWORD_INITIAL] });
    animateCustomLoginNative(this.animatedLoginDetails, loginArr, 2, 350, Easing.ease, 75).then(
      () => {
        this.setState({ screenState: [STATE_FORGOT_PASSWORD_INITIAL] })
        loginArr.forEach((value) => {
          this.animatedLoginDetails[value].setValue(2)
        })
      }
    )
    animateTimingNative(this.animatedForgotInput, 1, 350, Easing.ease)
    animateTimingNative(this.animatedButtonLog, 1, 500, Easing.ease)
    animateTimingNative(this.animatedButtonForgot, 1, 500, Easing.ease)
  }

  handleResetClick() {
    let screen = this.state.screenState
    if (screen.includes(STATE_FORGOT_PASSWORD_INITIAL)) {
      passwordResetInitialize(this.state.email).then(response => {
        if (response.status === 200) {
          this.setState({ screenState: [...this.state.screenState, STATE_FORGOT_PASSWORD_FINISH] });
          animateTimingPromiseNative(this.animatedForgotInput, 2, 350, Easing.ease).then(
            () => this.animatedForgotInput.setValue(2)
          )
          animateCustomForgotNative(this.animatedForgotDetails, forgotArr, 1, 350, Easing.ease, 75).then(
            () => {
              this.setState({ screenState: [STATE_FORGOT_PASSWORD_FINISH] })
              this.setState({ alertTitle: 'Email Sent', alertMessage: `Please check your email: ${this.state.email} for verification code`, showAlert: true })
            }
          )
        } else {
          this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'PasswordResetInitialize failed', showAlert: true })
        }
      })
    } else {
      this.handleConfirmResetClick()
    }
  }

  // LOGIN SCREEN

  saveLoginDetails(token) {
    let username = this.state.usernameLogin.trim()
    this.props.setAuthToken(token)
    this.props.setUsername(username)
    writeDataToStorage(token, TOKEN_DATA_KEY)
    writeDataToStorage(username, USERNAME_DATA_KEY)
  }

  resetLoginDetails() {
    this.setState({ usernameLogin: '', passwordLogin: '' })
    this.refs.loginPasswordInput.clearText()
    this.refs.loginUsernameInput.clearText()
  }

  handleLoginClick() {
    let invalidFields = getInvalidLoginDetails(this.state.usernameLogin.trim(), this.state.passwordLogin)
    if (invalidFields.length == 0) {
      loginUser(this.state.usernameLogin, this.state.passwordLogin).then(response => {
        if (response.data.access_token) {
          this.saveLoginDetails(response.data.access_token)
          this.props.setNewAccount(false)
          this.props.navigateToHomeScreen()
          this.resetLoginDetails()
        } else {
          this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'LoginUser Failed', showAlert: true })
        }
      })
    } else {
      this.setState({ alertTitle: 'Error', alertMessage: `Invalid: ${invalidFields.join(', ')}`, showAlert: true })
    }
  }

  handleVerifyClick() {
    reVerifyEmail(this.props.email).then(response => {
      if (response.status === 200) {
        this.setState({ alertTitle: 'Verication email resent', alertMessage: 'Verification email sent to: ' + this.props.email, showAlert: true })
      } else {
        this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'VerifyEmail Failed', showAlert: true })
      }
    })
  }

  setUserTextInput(text) {
    this.setState({ usernameLogin: text })
  }

  setPasswordTextInputLogin(text) {
    this.setState({ passwordLogin: text })
  }

  togglePasswordMaskLogin() {
    this.setState({ maskPasswordLogin: !this.state.maskPasswordLogin });
  }

  renderLogin() {
    // animate
    let leftLoginPositions = []
    loginArr.forEach((value) => {
      leftLoginPositions[value] = this.animatedLoginDetails[value].interpolate({
        inputRange: [0, 1, 2],
        outputRange: [width, 0, -width]
      })
    })
    return (
      <View style={styles.parentContainer}>
        {this.props.newAccount ?
          <Animated.View style={[styles.verifyContainer, { transform: [{ translateX: leftLoginPositions[0] }] }]}>
            <Text style={styles.verifyText}>{"Did not receive email? "}
              <Text onPress={() => this.handleVerifyClick()} style={styles.verifyLink}>{"Click here"}</Text>
              {" to resend it."}</Text>
          </Animated.View>
          : null}
        <LoginInput
          ref='loginUsernameInput'
          editable={true}
          setText={this.setUserTextInput.bind(this)}
          style={[{ transform: [{ translateX: leftLoginPositions[0] }] }, { 'marginBottom': 1 }]}
          labelName={"Username"} />
        <PasswordInput
          ref='loginPasswordInput'
          editable={true}
          togglePassword={this.togglePasswordMaskLogin.bind(this)}
          maskPassword={this.state.maskPasswordLogin}
          setText={this.setPasswordTextInputLogin.bind(this)}
          style={{ transform: [{ translateX: leftLoginPositions[1] }] }}
          labelName={"Password"} />

        <Animated.View style={{ transform: [{ translateX: leftLoginPositions[1] }] }}>
          <TouchableOpacity style={styles.forgotButton} onPress={() => this.handleForgotClick()}>
            <Text style={styles.forgotText}>{'Forgot Password?'}</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    )
  }
  // create account

  handleRegisterClick() {
    let invalidFields = getInvalidRegisterDetails(this.state.usernameReg.trim(), this.state.emailReg.trim(), this.state.passwordReg, this.state.passwordRepeatReg)
    if (invalidFields.length === 0) {
      registerUser(this.state.usernameReg.trim(), this.state.emailReg.trim(), this.state.passwordReg).then(response => {
        if (response.status === 200) {
          this.props.setEmail(this.state.emailReg.trim())
          this.props.setNewAccount(true)
          this.animateToLoginFromCreate()
        } else {
          this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'registerUser failed', showAlert: true })
        }
      })
    } else {
      this.setState({ alertTitle: 'Error', alertMessage: "Invalid: " + invalidFields.join(', '), showAlert: true })
    }
  }

  setEmailTextInputReg(text) {
    this.setState({ emailReg: text });
  }

  setUsernameTextInput(text) {
    this.setState({ usernameReg: text });
  }

  setPasswordTextInputReg(text) {
    this.setState({ passwordReg: text });
  }

  setPasswordRepeatTextInputReg(text) {
    this.setState({ passwordRepeatReg: text });
  }

  togglePasswordMaskReg() {
    this.setState({ maskPasswordReg: !this.state.maskPasswordReg });
  }

  togglePasswordRepeatMaskReg() {
    this.setState({ maskPasswordRepeatReg: !this.state.maskPasswordRepeatReg });
  }

  renderRegister() {
    // animate
    let leftPositions = []
    regArr.forEach((value) => {
      leftPositions[value] = this.animatedRegDetails[value].interpolate({
        inputRange: [0, 1, 2],
        outputRange: [width, 0, -width]
      })
    })
    return (
      <View style={styles.parentContainer}>
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          editable={true}
          setText={this.setEmailTextInputReg.bind(this)}
          style={[{ transform: [{ translateX: leftPositions[0] }] }, { "marginBottom": 1 }]}
          labelName={"Email"} />
        <LoginInput
          ref={ref => (this.loginInputName = ref)}
          editable={true}
          setText={this.setUsernameTextInput.bind(this)}
          style={[{ transform: [{ translateX: leftPositions[1] }] }, { "marginBottom": 1 }]}
          labelName={"Username"} />
        <PasswordInput
          ref={ref => (this.loginInputName = ref)}
          editable={true}
          togglePassword={this.togglePasswordMaskReg.bind(this)}
          maskPassword={this.state.maskPasswordReg}
          setText={this.setPasswordTextInputReg.bind(this)}
          style={[{ transform: [{ translateX: leftPositions[2] }] }, { "marginBottom": 1 }]}
          labelName={"Password"} />
        <PasswordInput
          ref={ref => (this.loginInputName = ref)}
          editable={true}
          togglePassword={this.togglePasswordRepeatMaskReg.bind(this)}
          maskPassword={this.state.maskPasswordRepeatReg}
          setText={this.setPasswordRepeatTextInputReg.bind(this)}
          style={{ transform: [{ translateX: leftPositions[3] }] }}
          labelName={"Repeat Password"} />
      </View>
    )
  }

  // Forgot Password

  handleConfirmResetClick() {
    let invalidFields = getInvalidForgotPasswordDetails(this.state.password, this.state.passwordRepeat, this.state.code)
    if (invalidFields.length === 0) {
      passwordResetConfirm(this.state.email, Number(this.state.code), this.state.password).then(response => {
        if (response.status === 200) {
          this.setState({ alertTitle: 'Password Sucessfully reset', alertMessage: 'Password succesfully reset. Press Ok to log in.', showAlert: true, alertState: 1 })
        } else {
          this.setState({ alertTitle: 'Error', alertMessage: response.data.message ? response.data.message : 'PasswordResetConfirm Failed', showAlert: true })
        }
      })
    } else {
      this.setState({ alertTitle: 'Error', alertMessage: "Invalid: " + invalidFields.join(', '), showAlert: true })
    }
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
    const inputPosition = this.animatedForgotInput.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [width, 0, -width]
    })
    return (
      <View style={styles.parentContainer}>
        <LoginInput
          ref={ref => (this.emailInputName = ref)}
          editable={true}
          setText={this.setEmailTextInput.bind(this)}
          style={[{ "marginBottom": 1 }, { transform: [{ translateX: inputPosition }] }]}
          labelName={"Email"} />
      </View>
    )
  }

  renderPasswordResetFinal() {
    let leftPositions = []
    forgotArr.forEach((value) => {
      leftPositions[value] = this.animatedForgotDetails[value].interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0]
      })
    })
    return (
      <View style={styles.parentContainer}>
        <LoginInput
          ref={ref => (this.codeInputName = ref)}
          editable={true}
          setText={this.setCodeTextInput.bind(this)}
          style={[{ "marginBottom": 1 }, { transform: [{ translateX: leftPositions[0] }] }]}
          labelName={"Code"} />
        <PasswordInput
          ref={ref => (this.passwordInputName = ref)}
          editable={true}
          togglePassword={this.togglePasswordMask.bind(this)}
          maskPassword={this.state.maskPassword}
          style={[{ "marginBottom": 1 }, { transform: [{ translateX: leftPositions[1] }] }]}
          setText={this.setPasswordTextInput.bind(this)}
          labelName={"New Password"} />
        <PasswordInput
          ref={ref => (this.passwordRepeatInputName = ref)}
          editable={true}
          togglePassword={this.togglePasswordRepeatMask.bind(this)}
          maskPassword={this.state.maskPasswordRepeat}
          style={{ transform: [{ translateX: leftPositions[2] }] }}
          setText={this.setPasswordRepeatTextInput.bind(this)}
          labelName={"Repeat New Password"} />
      </View>
    )
  }

  onPressAlertPositiveButton = () => {
    if (this.state.alertState === 1) {
      this.animateToLogin()
      this.setState({ alertState: 0 })
    }
    this.setState({ showAlert: false })
  };
  onPressExitAlertPositiveButton = () => {
    BackHandler.exitApp()
    this.setState({ showExitAlert: false })
  };
  onPressExitAlertNegativeButton = () => {
    this.setState({ showExitAlert: false })
  };

  render() {
    var logoImage = require("../../assets/images/logo1.png");
    var arrowback = require("../../assets/images/back_arrow.png");
    var topVector = require("../../assets/images/topVector.png");
    var bottomVector = require("../../assets/images/bottomVector.png");
    var currentScreen = this.state.screenState;
    // animations
    const buttonPosition = this.animatedStartButtons.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 180]
    })
    const titleHorizontalPosition = this.animatedTitle.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20]
    })
    const titleVerticalPosition = this.animatedTitle.interpolate({
      inputRange: [0, 1],
      outputRange: [height / 2 - 106, 0]
    })
    const backArrowPosition = this.animatedTitle.interpolate({
      inputRange: [0, 1],
      outputRange: [-92, 0]
    })
    const logButtonPosition = this.animatedButtonLog.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width]
    })
    const regButtonPosition = this.animatedButtonReg.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width]
    })
    const forgotButtonPosition = this.animatedButtonForgot.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0]
    })
    return (
      <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
        <CustomAlertComponent
          displayAlert={this.state.showAlert}
          alertTitleText={this.state.alertTitle}
          alertMessageText={this.state.alertMessage}
          displayPositiveButton={true}
          positiveButtonText={'OK'}
          onPressPositiveButton={this.onPressAlertPositiveButton}
        />
        <CustomAlertComponent
          displayAlert={this.state.showExitAlert}
          alertTitleText={'Confirm exit'}
          alertMessageText={'Do you want to quit the app?'}
          displayPositiveButton={true}
          positiveButtonText={'OK'}
          displayNegativeButton={true}
          negativeButtonText={'CANCEL'}
          onPressPositiveButton={this.onPressExitAlertPositiveButton}
          onPressNegativeButton={this.onPressExitAlertNegativeButton}
        />
        <Image style={styles.topVector} source={topVector} />
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.arrowBackContainer, { transform: [{ translateX: backArrowPosition }] }]}>
            <TouchableOpacity onPress={() => this.handleBackClick(currentScreen)}>
              <Image style={styles.arrowback} source={arrowback} />
            </TouchableOpacity>
          </Animated.View>
          <Animated.Image style={[styles.logo, { transform: [{ translateX: titleHorizontalPosition }, { translateY: titleVerticalPosition }] }]} source={logoImage} />
        </View>
        {this.state.screenState.includes(STATE_LOGIN) && this.renderLogin()}
        {this.state.screenState.includes(STATE_CREATE_ACCOUNT) && this.renderRegister()}
        {this.state.screenState.includes(STATE_FORGOT_PASSWORD_INITIAL) && this.renderPasswordResetInitial()}
        {this.state.screenState.includes(STATE_FORGOT_PASSWORD_FINISH) && this.renderPasswordResetFinal()}
        <Animated.View style={[styles.buttonsContainer, { transform: [{ translateY: buttonPosition }] }]}>
          <MultiPurposeButton
            handleButtonClick={this.handleSignInClick.bind(this)}
            style={[styles.signInButton, { transform: [{ translateX: logButtonPosition }] }]}
            buttonName={"Sign in"}
          />
          <MultiPurposeButton
            handleButtonClick={this.handleCreateClick.bind(this)}
            style={[styles.createButton, { transform: [{ translateX: regButtonPosition }] }]}
            buttonName={"Create Account"}
          />
          <MultiPurposeButton
            handleButtonClick={this.handleResetClick.bind(this)}
            style={[styles.resetButton, { transform: [{ translateX: forgotButtonPosition }] }]}
            buttonName={"Reset Password"}
          />
        </Animated.View>
        <Image style={styles.bottomVector} source={bottomVector} />
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

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);