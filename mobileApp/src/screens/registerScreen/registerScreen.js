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

class RegisterScreen extends React.Component {

  handleLoginClick() {

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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);