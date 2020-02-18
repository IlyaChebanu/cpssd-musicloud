import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from "prop-types";
import styles from './styles';

export default class CustomAlertComponent extends React.Component {

  onNegativeButtonPress = () => {
    this.props.onPressNegativeButton();
  };

  onPositiveButtonPress = () => {
    this.props.onPressPositiveButton();
  };

  render() {
    return (
      <Modal
        visible={this.props.displayAlert}
        transparent={true}
        animationType={"fade"}>
        <View style={styles.mainOuterComponent}>
          <View style={styles.mainContainer}>
            {/* First Row - Alert Icon and Title */}
            <View style={styles.topPart}>
              {
                  this.props.displayAlertIcon
                  &&
                  <Image
                    source={require('../../assets/images/logo_icon.png')}
                    resizeMode={'contain'}
                    style={styles.alertIconStyle}
                  />
                }
              <Text style={styles.alertTitleTextStyle}>
                {`${this.props.alertTitleText}`}
              </Text>
            </View>
            {/* Second Row - Alert Message Text */}
            <View style={styles.middlePart}>
              <Text style={styles.alertMessageTextStyle}>
                {`${this.props.alertMessageText}`}
              </Text>
            </View>
            {/* Third Row - Positive and Negative Button */}
            <View style={styles.bottomPart}>
              {
                this.props.displayPositiveButton
                &&
                <TouchableOpacity
                  onPress={this.onPositiveButtonPress}
                  style={styles.alertMessageButtonStyle} >
                  <Text style={styles.alertMessageButtonTextStyle}>{this.props.positiveButtonText}</Text>
                </TouchableOpacity>
              }
              {
                this.props.displayNegativeButton
                &&
                <TouchableOpacity
                  onPress={this.onNegativeButtonPress}
                  style={styles.alertMessageButtonStyle}>
                  <Text style={styles.alertMessageButtonTextStyle}>{this.props.negativeButtonText}</Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

CustomAlertComponent.propTypes = {
  displayAlert: PropTypes.bool,
  displayAlertIcon: PropTypes.bool,
  alertTitleText: PropTypes.string,
  alertMessageText: PropTypes.string,
  displayPositiveButton: PropTypes.bool,
  positiveButtonText: PropTypes.string,
  displayNegativeButton: PropTypes.bool,
  negativeButtonText: PropTypes.string,
  onPressPositiveButton: PropTypes.func,
  onPressNegativeButton: PropTypes.func,
}
