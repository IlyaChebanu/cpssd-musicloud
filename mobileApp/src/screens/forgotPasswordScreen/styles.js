import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    backgroundColor: '#1B1E23',
    flex: 1,
  },
  logoContainer: {
    marginTop: height > 600 ? 100 : 80,
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
  resetButton: {
    position: 'absolute',
    bottom: height > 600 ? 100 : 50,
  },
})