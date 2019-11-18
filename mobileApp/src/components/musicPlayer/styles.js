import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1E23',
  },
  backgroundVideo: {
    backgroundColor: '#1B1E23',
    height: Platform.OS === 'android' ? height > 600 ? 375 : 300 : height > 600 ? 420 : 300,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  songImg: {
    position: 'absolute',
    width: width,
    height: height > 600 ? 375 : 250,
    top: 0,
    left: 0,
    right: 0,
  },
  textContainer: {
    marginTop: Platform.OS === 'android' ? height > 600 ? 360 : 300 : height > 600 ? 440 : 280,
  },
  songNameText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 20,
  },
  songAuthorText: {
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
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }

});