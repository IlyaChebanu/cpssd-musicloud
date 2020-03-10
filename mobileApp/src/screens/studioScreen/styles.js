import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import { ratio } from '../../utils/styles';

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
  uploadButton: {
    top: 50,
  },
  recordButton: {
    top: 70,
  },

  recordContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: height > 600 ? 100 * ratio : 50 * ratio,
    color: 'white',
    fontSize: 28 * ratio,
  },
  viewRecorder: {
    marginTop: 40 * ratio,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: height > 600 ? 60 * ratio : 20 * ratio,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginTop: 28 * ratio,
    marginHorizontal: 28 * ratio,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4 * ratio,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'white',
    height: 4 * ratio,
    width: 0,
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40 * ratio,
  },
  txtRecordCounter: {
    marginTop: 32 * ratio,
    color: 'white',
    fontSize: 20 * ratio,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12 * ratio,
    color: 'white',
    fontSize: 20 * ratio,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  recordBtn: {
    backgroundColor: '#888',
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopRecContainer: {
    height: 100,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopRecBtn: {
    backgroundColor: '#777',
    height: 75,
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playImgs: {
    height: 48,
    width: 48,
  },
  playerImgs: {
    paddingRight: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  goBackImg: {
    width: 32,
    height: 32,
  },
  uploadContainer: {
    marginTop: 30,
  },
  uploadText: {
    color: '#FFF',
    fontSize: 24,
  },

  inputContainer: {
    backgroundColor: '#444',
    margin: 20,
    position: 'absolute',
    width: width-40,
    height: 120,
    top: height/2-60,
    paddingTop: 10,
    borderRadius: 5,
  },
  audioNameInput: {
    fontSize: 24,
    borderBottomColor: '#FFF',
    borderBottomWidth: 1,
    color: 'rgba(255,255,255,1)',
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  loginLabelName: {
    marginRight: 8,
    paddingLeft: 10,
    color: 'rgba(255,255,255,1)',
  },
  uploadFinalText: {
    color: '#FFF',
    fontSize: 22,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  topAudioNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crossImg: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  grayContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    flex: 1,
    width: width,
    height: height,
  },
})