import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#000',
    },
    profileImg: {
      width: 25,
      height: 25,
      borderRadius: 13,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    header: {
      marginTop: 17,
      marginBottom: 17,
      width: width,
    },
    headerClose: {
      position: 'absolute',
      top: 10,
      left: 0,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
    headerText: {
      color: "#FFF",
      fontSize: 18,
      textAlign: 'center',
    },
    songImage: {
      width: width,
      height: height * 0.3,
      marginBottom: 20,
    },
    songTitle: {
      textAlign: 'center',
      color: "white",
      fontFamily: "Helvetica Neue",
      marginBottom: 10,
      marginTop: 13,
      fontSize: 19
    },
    authorText: {
      color: "#BBB",
      fontFamily: "Helvetica Neue",
      fontSize: 14,
      marginLeft: 5,
    },
    controls: {
      flexDirection: 'row',
      marginTop: 30,
    },
    back: {
      marginTop: 22,
      marginLeft: width > 320 ? 45 : 25,
    },
    play: {
      marginLeft: width > 320 ? 50 : 25,
      marginRight: width > 320 ? 50 : 25,
    },
    forward: {
      marginTop: 22,
      marginRight: width > 320 ? 45 : 25,
    },
    addplaylist: {
      marginTop: 26,
    },
    volume: {
      marginTop: 26,
    },
    titleContainer: {
      width: width,
      justifyContent: 'center',
    },
    likeContainer: {
      position: 'absolute',
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    likeIcon: {

    },
    likesText: {
      color: '#F4414F',
    },
    unlikesText: {
      color: '#FFF',
    },
    sliderContainer: {
      width: width - 40,
    },
    timeInfo: {
      flexDirection: 'row',
    },
    time: {
      color: '#FFF',
      flex: 1,
      fontSize: 10,
    },
    timeRight: {
      color: '#FFF',
      textAlign: 'right',
      flex: 1,
      fontSize: 10,
    },
    slider: {
      height: 20,
    },
    sliderTrack: {
      height: 2,
      backgroundColor: '#333',
    },
    sliderThumb: {
      width: 10,
      height: 10,
      backgroundColor: '#f62976',
      borderRadius: 10 / 2,
      shadowColor: 'red',
      shadowOffset: {width: 0, height: 0},
      shadowRadius: 2,
      shadowOpacity: 1,
    }
  });