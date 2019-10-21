import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
      paddingTop: height > 600 ? 70 : 50,
      backgroundColor: '#1B1E23',
      flex: 1,
    },
    logoContainer: {
      marginTop: 30,
      flexDirection: 'row',
      marginLeft: 20,
      alignItems: 'center',
      marginBottom: height > 600 ? 50 : 20,
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
    signInButton: {
      position: 'absolute',
      bottom: height > 600 ? 100 : 50,
    }
})