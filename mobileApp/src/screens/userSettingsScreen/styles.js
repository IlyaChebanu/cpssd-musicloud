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
    paddingBottom: 20,
  },
  saveButton: {
    marginBottom: 20,
    paddingTop: 20,
  },
  orientationText: {
    color: '#FFF',
    fontSize: 16,
  },
  orientationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  notificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  notificationText: {
    color: '#FFF',
    fontSize: 16,
  },
  notificationsSettings: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1,
  },
})