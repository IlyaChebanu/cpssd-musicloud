import React from "react";
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { StyleSheet, Text, View, Image, Alert, BackHandler } from "react-native";
import GLOBALS from "../../utils/globalStrings";
import styles from "./styles";
import LoginInput from "../../components/loginInput/loginInput";
import { SafeAreaView } from "react-navigation";
import PasswordInput from "../../components/passwordInput/passwordInput";
import MultiPurposeButton from "../../components/multiPurposeButton/multiPurposeButton";
import HeaderComponent from "../../components/headerComponent/headerComponent";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { patchUserDetails, patchNotifications, patchNotificationsFollow, patchNotificationsPost, patchNotificationsSong, patchNotificationsLike } from "../../api/usersAPI";
import { getInvalidUserSettingsDetails } from "../../utils/helpers";
import ToggleSwitch from '../../components/toggleSwitch/toggleSwitch';
import Orientation from 'react-native-orientation';
import { writeDataToStorage, SETTINGS_PORTRAIT_DATA_KEY, SETTINGS_NOTIFICATION_DATA_KEY, SETTINGS_NOTIFICATION_FOLLOW_DATA_KEY, SETTINGS_NOTIFICATION_LIKE_DATA_KEY, SETTINGS_NOTIFICATION_POST_DATA_KEY, SETTINGS_NOTIFICATION_SONG_DATA_KEY } from "../../utils/localStorage";
import CustomAlertComponent from "../../components/alertComponent/customAlert";

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
            showAlert: false,
            alertTitle: '',
            alertMessage: '',
            showExitAlert: false,
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }

    handleAndroidBackPress = () => {
        this.setState({ showExitAlert: true })
        return true;
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
                    this.setState({ alertTitle: 'Success', alertMessage: response.data.message, showAlert: true })
                } else {
                    this.setState({ alertTitle: 'Error', alertMessage: response.data.message, showAlert: true })
                }
            });
        } else {
            this.setState({ alertTitle: 'Error', alertMessage: "Invalid: " + invalidFields.join(', '), showAlert: true })
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

    toggleNotification(isOn) {
        this.props.setIsNotification(isOn)
        this.props.setIsNotificationFollow(isOn)
        this.props.setIsNotificationPost(isOn)
        this.props.setIsNotificationSong(isOn)
        this.props.setIsNotificationLike(isOn)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_DATA_KEY)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_FOLLOW_DATA_KEY)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_POST_DATA_KEY)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_SONG_DATA_KEY)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_LIKE_DATA_KEY)
        if (isOn) {
            patchNotifications(this.props.token, 0)
        } else if (!isOn) {
            patchNotifications(this.props.token, 1)
        }
    }

    toggleNotificationFollow(isOn) {
        this.props.setIsNotificationFollow(isOn)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_FOLLOW_DATA_KEY)
        if (isOn) {
            patchNotificationsFollow(this.props.token, 0)
        } else if (!isOn) {
            patchNotificationsFollow(this.props.token, 1)
            if (!this.props.isNotificationPost && !this.props.isNotificationSong && !this.props.isNotificationLike) {
                console.warn('yes')
                this.toggleNotification(false)
            }
        } 
    }

    async toggleNotificationPost(isOn) {
        this.props.setIsNotificationPost(isOn)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_POST_DATA_KEY)
        if (isOn) {
            patchNotificationsPost(this.props.token, 0)
        } else if (!isOn) {
            patchNotificationsPost(this.props.token, 1)
        }
    }

    async toggleNotificationSong(isOn) {
        this.props.setIsNotificationSong(isOn)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_SONG_DATA_KEY)
        if (isOn) {
            patchNotificationsSong(this.props.token, 0)
        } else if (!isOn) {
            patchNotificationsSong(this.props.token, 1)
        }
    }

    async toggleNotificationLike(isOn) {
        this.props.setIsNotificationLike(isOn)
        writeDataToStorage(isOn, SETTINGS_NOTIFICATION_LIKE_DATA_KEY)
        if (isOn) {
            patchNotificationsLike(this.props.token, 0)
        } else if (!isOn) {
            patchNotificationsLike(this.props.token, 1)
        }
    }

    onPressAlertPositiveButton = () => {
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
        let notificationsOn = this.props.isNotification
        return (
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ 'backgroundColor': '#3D4044', 'flex': 1 }}>
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
                            
                            <View style={styles.notificationsContainer}>
                                <Text style={styles.notificationText}>{'All Notifications'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isNotification}
                                    onToggle={(isOn) => this.toggleNotification(isOn)}
                                />
                            </View>
                        
                            {/* <View style={!notificationsOn && styles.notificationsSettings} pointerEvents={notificationsOn ? 'auto' : 'none'}> */}
                            <View style={styles.notificationsContainer}>
                                <Text style={styles.notificationText}>{'Follow Notifications'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isNotificationFollow}
                                    onToggle={(isOn) => this.toggleNotificationFollow(isOn)}
                                />
                            </View>

                            <View style={styles.notificationsContainer}>
                                <Text style={styles.notificationText}>{'Post Notifications'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isNotificationPost}
                                    onToggle={(isOn) => this.toggleNotificationPost(isOn)}
                                />
                            </View>

                            <View style={styles.notificationsContainer}>
                                <Text style={styles.notificationText}>{'Song Notifications'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isNotificationSong}
                                    onToggle={(isOn) => this.toggleNotificationSong(isOn)}
                                />
                            </View>

                            <View style={styles.notificationsContainer}>
                                <Text style={styles.notificationText}>{'Like Notifications'}</Text>
                                <ToggleSwitch
                                    isOn={this.props.isNotificationLike}
                                    onToggle={(isOn) => this.toggleNotificationLike(isOn)}
                                />
                            </View>
                            {/* </View> */}
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
        isNotification: state.user.isNotification,
        isNotificationFollow: state.user.isNotificationFollow,
        isNotificationPost: state.user.isNotificationPost,
        isNotificationSong: state.user.isNotificationSong,
        isNotificationLike: state.user.isNotificationLike,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsScreen);