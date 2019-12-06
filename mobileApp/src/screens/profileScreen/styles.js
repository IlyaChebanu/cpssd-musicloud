import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    color: 'white',
    fontSize: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  followContainer: {
    flex: 1,
  },
  followTabs: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(61,64,68,0.75)',
  },
  profileContainer: {
    flex: 1,
  },
  profileTabs: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(61,64,68,0.75)',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    position: 'absolute',
    borderBottomColor: '#FFF',
    borderBottomWidth: 4,
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
  },
  tabClick: {
    height: '100%',
    width: width/2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePostTab: {
    flex: 1,
  },
  profileSongTab: {
    flex: 1,
  },
  tabTitleText: {
    color: '#FFF'
  },
})