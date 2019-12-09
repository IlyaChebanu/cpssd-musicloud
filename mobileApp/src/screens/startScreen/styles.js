import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    arrowBackContainer: {
      alignItems: 'center',
      width: 32,
      height: 32,
      left: 10,
      resizeMode: 'contain',
      position: 'absolute',
      top: 50 + 42,
    },
    logoContainer: {

    },
    logo: {
      position: 'absolute',
      top: 50,
      left: 30,
      width: width-60,
      resizeMode: 'contain'
    },
    parentContainer: {
      position: 'absolute', 
      width: width,
      top: 180,
    },
    forgotButton: {
      alignSelf: 'flex-end',
      marginRight: 20,
      marginTop: 20,
      marginBottom: 20,
    },
    forgotText: {
      color: '#FFF',
    },
    signInButton: {
      marginBottom: 20,
    },
    createButton: {

    },
    resetButton: {
      position: 'absolute',
    },
    buttonsContainer: {
      position: 'absolute',
      bottom: 60,
      zIndex: 2,
    },
    verifyContainer: {
      top: -25,
      position: 'absolute',
      paddingLeft: 20,
      paddingBottom: 5,
    },
    verifyLink: {
      textDecorationLine: 'underline'
    },
    verifyText: {
      color: '#FFF',
    },
    topVector: {
      position: 'absolute',
      top: 0,
      width: width,
      resizeMode: 'cover',
      zIndex: -1,
    },
    bottomVector: {
      position: 'absolute',
      bottom: -20,
      width: width,
      resizeMode: 'cover',
      zIndex: -1,
    },
})