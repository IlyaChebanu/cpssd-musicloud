import { StyleSheet, Dimensions, Platform } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
const { width, height } = Dimensions.get("window");

let offlineHeight = isIphoneX() ? 60 : 30
let topHeightMargin = isIphoneX() ? 0 : 20
let margin = isIphoneX() ? 20 : 0

export default StyleSheet.create({
    offlineContainer: {
        flexDirection: 'row',
        position: 'absolute',
        height: offlineHeight,
        width: width,
        top: Platform.OS === 'android' ? 0 : topHeightMargin,
        backgroundColor: '#b52424',
        justifyContent: 'center',
        alignItems: 'center',
      },
      offlineText: { 
        fontSize: 14,
        color: 'rgb(255, 255, 255)',
        marginTop: margin,
      }

});