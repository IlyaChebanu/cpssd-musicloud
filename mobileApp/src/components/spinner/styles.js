import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");
export default StyleSheet.create({
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: width,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
     },

});