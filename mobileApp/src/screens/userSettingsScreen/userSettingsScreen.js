import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Alert } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import { SafeAreaView } from "react-navigation";
import PasswordInput from "../../components/passwordInput/passwordInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { patchUserDetails } from "../../api/usersAPI";
import { getInvalidUserSettingsDetails } from "../../utils/helpers";
import ToggleSwitch from '../../components/toggleSwitch/toggleSwitch';
import Orientation from 'react-native-orientation';
import { writeDataToStorage, SETTINGS_PORTRAIT_DATA_KEY } from "../../utils/localStorage";

class UserSettingsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            oldPassword: '',
            newPassword: '',
            newPasswordRepeat: '',
            maskOldPassword: true,
            maskNewPassword: true,
            maskNewPasswordRepeat: true,
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

    setEmailTextInput(text) {
        this.setState({ email: text });
    }

    setOldPasswordTextInput(text) {
        this.setState({ oldPassword: text });
    }

    setNewPasswordTextInput(text) {
        this.setState({ newPassword: text });
    }

    setNewPasswordRepeatTextInput(text) {
        this.setState({ newPasswordRepeat: text });
    }

    toggleOldPasswordMask() {
        this.setState({ maskOldPassword: !this.state.maskOldPassword });
    }

    toggleNewPasswordMask() {
        this.setState({ maskNewPassword: !this.state.maskNewPassword });
    }

    toggleNewPasswordRepeatMask() {
        this.setState({ maskNewPasswordRepeat: !this.state.maskNewPasswordRepeat });
    }

    handleSaveChangesClick() {
        let invalidFields = getInvalidUserSettingsDetails(this.state.oldPassword, this.state.email, this.state.newPassword, this.state.newPasswordRepeat);
        if (invalidFields.length === 0) {
            patchUserDetails(this.state.oldPassword, this.state.newPassword, this.state.email, this.props.token).then(response => {
                if (response.status === 200) {
                    this.showAlert('Success', response.data.message);
                } else {
                    this.showAlert('Error', (response.data.message));
                }
            });
        } else {
            this.showAlert('Error', "Invalid: " + invalidFields.join(', '));
        }
    }

    toggleOrientation(isOn) {
        this.props.setIsPortrait(isOn)
        writeDataToStorage(isOn, SETTINGS_PORTRAIT_DATA_KEY)
        if (isOn) {
            Orientation.lockToPortrait();
        } else if (!isOn) {
            Orientation.unlockAllOrientations();
        }
    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    <View style={styles.container}>
                        <KeyboardAwareScrollView>
                            <Text style={styles.titleText}>{"USER SETTINGS"}</Text>

                            <PasswordInput
                                ref={ref => (this.loginInputName = ref)}
                                togglePassword={this.toggleOldPasswordMask.bind(this)}
                                maskPassword={this.state.maskOldPassword}
                                setText={this.setOldPasswordTextInput.bind(this)}
                                style={{ "marginBottom": 25 }}
                                editable={true}
                                labelName={"Current Password"} />

                            <LoginInput
                                ref={ref => (this.loginInputName = ref)}
                                setText={this.setEmailTextInput.bind(this)}
                                style={{ "marginBottom": 15 }}
                                editable={this.state.oldPassword.length >= 1}
                                labelName={"New Email"} />

                            <PasswordInput
                                ref={ref => (this.loginInputName = ref)}
                                togglePassword={this.toggleNewPasswordMask.bind(this)}
                                maskPassword={this.state.maskNewPassword}
                                setText={this.setNewPasswordTextInput.bind(this)}
                                style={{ "marginBottom": 1 }}
                                editable={this.state.oldPassword.length >= 1}
                                labelName={"New Password"} />

                            <PasswordInput
                                ref={ref => (this.loginInputName = ref)}
                                togglePassword={this.toggleNewPasswordRepeatMask.bind(this)}
                                maskPassword={this.state.maskNewPasswordRepeat}
                                setText={this.setNewPasswordRepeatTextInput.bind(this)}
                                editable={this.state.oldPassword.length >= 1}
                                style={{ "marginBottom": 20 }}
                                labelName={"New Password Repeat"} />

                            <MultiPurposeButton
                                handleButtonClick={this.handleSaveChangesClick.bind(this)}
                                style={styles.saveButton}
                                buttonName={"Save Changes"}
                            />
                            <View style={styles.orientationContainer}>
                                <Text style={styles.orientationText}>{'Lock Portrait Orientation'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isPortrait}
                                    onToggle={(isOn) => this.toggleOrientation(isOn)}
                                />
                            </View>
                        </KeyboardAwareScrollView>

                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.home.token,
        isPortrait: state.user.isPortrait,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsScreen);