import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  songContainer: {
    width: width - 40,
    height: 220,
    marginBottom: 20,
    marginLeft: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartlike: {
    width: 50,
    height: 50,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  playImage: {
    resizeMode: 'contain',
    width: 60,
    height: 60,
  },
  songImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    resizeMode: 'cover',
  },
  songDetailsContainer: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
  },
  songNameText: {
    color: '#FFF',
    fontSize: 18,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textShadowColor: '#666',
  },
  authorNameText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 5,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textShadowColor: '#666',
  },
  likedText: {
    fontSize: 18,
    color: '#F4414F',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textShadowColor: '#666',
  },
  likes: {
    fontSize: 18,
    color: '#FFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textShadowColor: '#666',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  likeImg: {

  },
})