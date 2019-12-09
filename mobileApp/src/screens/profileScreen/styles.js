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
    position: 'absolute',
    top: 80,
  },
  followTabs: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(61,64,68,0.75)',
  },
  profileContainer: {
    flex: 1,
  },
  likedSongsContainer: {
    flex: 1,
    position: 'absolute',
    top: 80,
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

  songContainer: {
    width: width - 40,
    height: 220,
    marginBottom: 20,
    marginLeft: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  noSongsText: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
    width: width,
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
  likedSongTitleText: {
    color: 'white',
    fontSize: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
})