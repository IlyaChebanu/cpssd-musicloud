import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#3D4044',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
  },
  logo: {
    resizeMode: 'contain',
    width: 160,
  },
  arrowDownImg: {
    resizeMode: 'contain',
    height: 32,
    width: 32,
  },
})