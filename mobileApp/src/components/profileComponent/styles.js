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
      flex: 2
  },
  profileNum: {
    color: '#FFF',
    fontSize: 18,
  },
  profileText: {
      color: '#AAA',
      fontSize: 18,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  followingContainer: {
    marginTop: 10,
    marginLeft: 20,
    justifyContent: 'center',
    // alignItems: 'flex',
  },
  button: {
    borderRadius: 5,
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: {
    
  },
  followingNotButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    width: 100,
    height: 40,
  },
  followText: {
    color: '#FFF'
  }
})