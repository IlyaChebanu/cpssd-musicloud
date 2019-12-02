import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    headerContainer: {
        backgroundColor: '#3D4044',
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowBack: {
        marginRight: 10,
        resizeMode: 'contain',
        width: 32,
    },
    logo: {
        resizeMode: 'contain',
        width: 160,
    },
    menu: {
        resizeMode: 'contain',
        height: 32,
        width: 32,
    },
    menuButton: {

    },

})