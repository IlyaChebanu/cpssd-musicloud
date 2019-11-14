import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        backgroundColor: '#36393D',
        height: 120,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        borderRadius: 10,
    },
    createPostContainer: {
        height: 120,
        color: '#FFF',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        fontSize: 14,
        color: 'white',
        textAlignVertical: 'top',
    },
    buttonContainer: {
        height: 28,
        width: 52,
        borderRadius: 20,
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    button: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLabelName: {
        fontSize: 14,
        // fontFamily: "SFProDisplay-Medium",
        color: 'rgb(255, 255, 255)',
    },

});