import React from 'react';
import { View, TouchableOpacity,Animated, Image} from 'react-native';
import PropTypes from 'prop-types';
import styles from './styles';


export default class ToggleSwitch extends React.Component {
    static calculateDimensions(size) {
        let width, height, circleWidth, circleHeight, translateX
        if (size) {
            width = size.width
            height = size.height
            circleWidth= size.circleWidth
            circleHeight = size.circleHeight
            translateX = size.translateX
        }
        return ({
            width: width ? width : 63, height: height ? height: 36, circleWidth: circleWidth ? circleWidth : 27, circleHeight: circleHeight ? circleHeight : 27, translateX: translateX ? translateX : 39,
        });
    }

    static propTypes = {
        isOn: PropTypes.bool.isRequired,
        onToggle: PropTypes.func.isRequired,
    }

    static defaultProps = {
        isOn: false,
        onColor: '#3D4044',
        offColor: '#3D4044',
    }

    offsetX = new Animated.Value(0);
    dimensions = ToggleSwitch.calculateDimensions(this.props.size);

    createToggleSwitchStyle = () => ({
        justifyContent: 'center',
        width: this.dimensions.width,
        height: this.dimensions.height,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgb(221, 221, 221)',
        padding: this.dimensions.padding,
        backgroundColor: (this.props.isOn) ? this.props.onColor : this.props.offColor,
    })

    createInsideCircleStyle = () => ({
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft : 5,
        position: 'absolute',
        backgroundColor: this.props.isOn ? '#E78D35' : 'lightgray',
        transform: [{ translateX: this.offsetX }],
        width: this.dimensions.circleWidth,
        height: this.dimensions.circleHeight,
        borderRadius: (this.dimensions.circleWidth / 2),
    });

    renderIcon() {
        if (this.props.isOn) {
            return (
                <View>
                    <Image source={require("../../assets/images/iconTick.png")}></Image>
                </View>
            )
        } else {
            return (
                <View>
                    <Image source={require("../../assets/images/iconX.png")}></Image>
                </View>
            )
        }
    }

    render() {
        const toValue = this.props.isOn ? this.dimensions.width - this.dimensions.translateX : 0;
        Animated.timing( this.offsetX,
            {
                toValue,
                duration: 300,
            },
        ).start();
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={this.createToggleSwitchStyle()}
                    activeOpacity={0.8}
                    onPress={() => {
                        this.props.onToggle(!this.props.isOn);
                    }}
                >
                    <Animated.View style={this.createInsideCircleStyle()} >{this.renderIcon()}</Animated.View>
                </TouchableOpacity>
            </View>
        );
    }
}
