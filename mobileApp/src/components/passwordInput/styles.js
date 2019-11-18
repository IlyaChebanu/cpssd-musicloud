import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        width: width,
        height: 66,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    subContainer: {
        // flex: 1,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 12,
        marginBottom: 10,
    },
    loginLabelName: {
        fontSize: 12,
        marginRight: 8,
        //fontFamily: "SFProDisplay-Bold",
        color: 'rgba(255,255,255,1)',
    },
    disableLabelName: {
        fontSize: 12,
        marginRight: 8,
        color: '#000',
    },
    loginTextInput: {
        fontSize: 18,
        //fontFamily: "SFProDisplay-Medium",
        color: 'rgba(255,255,255,1)',
        marginTop: 5,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
    },

    imageContainer: {
        width: 70,
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: "center",
        alignItems: "center",
    },
    visImg: {
        width: 30,
        height: 30,
    },

});