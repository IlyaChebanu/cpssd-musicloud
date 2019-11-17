import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 200,
    right: 0,
    // width: width,
    // height: height,
  },
  videoText: {
    fontSize: 13,
    // fontFamily: "SFProDisplay-Medium",
    color: 'rgb(233, 244, 255)',
    //opacity: .50,
    position: 'absolute',
    textAlign: 'center',
    left: 0,
    bottom: 75,
    right: 0,
    
  },

  circle: {
    width: 100,
    height: 100,
    borderRadius: 100/2,
    backgroundColor: 'purple'
}
});