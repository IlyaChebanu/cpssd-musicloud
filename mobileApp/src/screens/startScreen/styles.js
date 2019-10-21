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
      marginTop: height/2-140,
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      marginLeft: 30,
      width: width-60,
      resizeMode: 'contain'
    },
    signInButton: {
      position: 'absolute',
      bottom: 100,
    },
    createButton: {
      position: 'absolute',
      bottom: 190,
    },
})