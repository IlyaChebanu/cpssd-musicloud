import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    color: '#FFF',
    fontSize: 18,
    paddingLeft: 30,
    paddingRight: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  profileTitleText: {
    color: 'white',
    fontSize: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  inputContainer: {
    backgroundColor: '#36393D',
    height: 120,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    // justifyContent: 'center',
  },
  createPost: {
    color: '#FFF',
    fontSize: 16,
    padding: 10,
  },
  postButton: {
    width: 50,
    height: 20,
  },
  postFlatList: {
    // marginTop: 10,
  },
  postContainer: {
    backgroundColor: '#36393D',
    height: 120,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  postText: {
    color: '#FFF',
    padding: 10,
    fontSize: 14,
  },
  timeAgo: {
    fontSize: 12,
    color: '#C3C3C3',
    position: 'absolute',
    bottom: 10,
    left: 10
  },
})