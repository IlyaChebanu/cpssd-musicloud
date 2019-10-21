import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    flexDirection: 'row',
  },
  statsContainer: {
      paddingLeft: 30,
  },
  profileNum: {
    color: '#FFF',
    fontSize: 18,
  },
  profileText: {
      color: '#AAA',
      fontSize: 18,
  },
})