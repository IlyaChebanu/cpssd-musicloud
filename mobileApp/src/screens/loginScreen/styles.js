import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    logoContainer: {
      marginTop: 100,
      flexDirection: 'row',
      marginLeft: 20,
      alignItems: 'center',
      marginBottom: 50,
    },
    arrowback: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
    },
    logo: {
      marginLeft: 20,
      width: width-144,
      resizeMode: 'contain'
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
      position: 'absolute',
      bottom: 100,
    }
})