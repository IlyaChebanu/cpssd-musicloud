import React from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import { SafeAreaView } from "react-navigation";
import PasswordInput from "../../components/passwordInput/passwordInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import HeaderComponent from "../../components/headerComponent/headerComponent";

export default class UserSettingsScreen extends React.Component {
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

    setEmailTextInput(text) {
        this.setState({ email: text })
    }

    setOldPasswordTextInput(text) {
        this.setState({ oldPassword: text })
    }

    setNewPasswordTextInput(text) {
        this.setState({ newPassword: text })
    }

    setNewPasswordRepeatTextInput(text) {
        this.setState({ newPasswordRepeat: text })
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

    }

    render() {
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
                <View style={{ 'backgroundColor': '#1B1E23', 'flex': 1 }}>
                    <HeaderComponent navigation={this.props.navigation} />
                    <View style={styles.container}>
                        <Text style={styles.titleText}>{"USER SETTINGS"}</Text>
                        <LoginInput
                            ref={ref => (this.loginInputName = ref)}
                            setText={this.setEmailTextInput.bind(this)}
                            style={{ "marginBottom": 25 }}
                            labelName={"Change Email"} />

                        <PasswordInput
                            ref={ref => (this.loginInputName = ref)}
                            togglePassword={this.toggleOldPasswordMask.bind(this)}
                            maskPassword={this.state.maskOldPassword}
                            setText={this.setOldPasswordTextInput.bind(this)}
                            style={{ "marginBottom": 1 }}
                            labelName={"Old Password"} />

                        <PasswordInput
                            ref={ref => (this.loginInputName = ref)}
                            togglePassword={this.toggleNewPasswordMask.bind(this)}
                            maskPassword={this.state.maskNewPassword}
                            setText={this.setNewPasswordTextInput.bind(this)}
                            style={{ "marginBottom": 1 }}
                            labelName={"New Password"} />

                        <PasswordInput
                            ref={ref => (this.loginInputName = ref)}
                            togglePassword={this.toggleNewPasswordRepeatMask.bind(this)}
                            maskPassword={this.state.maskNewPasswordRepeat}
                            setText={this.setNewPasswordRepeatTextInput.bind(this)}
                            style={{ "marginBottom": 40 }}
                            labelName={"New Password Repeat"} />

                        <MultiPurposeButton
                            handleButtonClick={this.handleSaveChangesClick.bind(this)}
                            style={styles.saveButton}
                            buttonName={"Save Changes"}
                        />
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}