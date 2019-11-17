import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1E23',
  },
  backgroundVideo: {
    backgroundColor: '#1B1E23',
    height: Platform.OS === 'android' ? 375 : 420,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  songImg: {
    position: 'absolute',
    width: width,
    height: 375,
    top: 0,
    left: 0,
    right: 0,
  },
  textContainer: {
    marginTop: 440,
  },
  songNameText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 20,
  },
  songTypeText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    marginLeft: 20,
    marginRight: 20,
  },
  playButton: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

});