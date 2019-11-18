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
  titleText: {
    color: 'white',
    fontSize: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
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