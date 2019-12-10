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
  playlistWindow: {
    backgroundColor: '#3D4044',
    position: 'absolute',
    alignSelf: 'center',
    top: height * 0.3,
    width: width * 0.6,
  },
  addText: {
    color: '#FFF',
    textAlign: 'center',
  },
  NewText: {
    color: '#FFF',
    textAlign: 'center',
  },
  playitemText: {
    color: '#FFF',
    textAlign: 'center',
  },
  playitemContainer: {
    padding: 5,
    margin: 5,
  },
  newContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#999',
    padding: 5,
    margin: 5,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  addContainer: {
    borderBottomWidth: 1,
    padding: 5,
    margin: 5,
    borderBottomColor: '#999',
  },
  newPlayText: {
    color: '#FFF',
    textAlign: 'center',
    paddingTop: 10,
  },
  playlistTitle: {
    borderBottomColor: '#FFF',
    borderBottomWidth: 1,
    margin: 10,
    color: '#FFF',
  },
  createText: {
    color: '#FFF',
    textAlign: 'center',
    paddingBottom: 10,
  },
})