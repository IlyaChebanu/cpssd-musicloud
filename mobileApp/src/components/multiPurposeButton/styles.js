import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    buttonContainer: {
        marginLeft: 20,
        height: 50,
        width: width-40,
    },
    button: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLabelName: {
        fontSize: 18,
        // fontFamily: "SFProDisplay-Medium",
        color: 'rgb(255, 255, 255)',
    },
});