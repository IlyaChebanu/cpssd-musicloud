import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    mainOuterComponent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000088'
    },
    mainContainer: {
        flexDirection: 'column',
        height: '25%',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#404040',
        borderRadius: 10,
        padding: 4,
    },
    topPart: {
        flex: 0.5,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 2,
        paddingVertical: 4
    },
    middlePart: {
        flex: 1,
        width: '100%',
        padding: 4,
        color: '#FFFFFF',
        fontSize: 16,
        marginVertical: 2
    },
    bottomPart: {
        flex: 0.5,
        width: '100%',
        flexDirection: 'row',
        padding: 4,
        justifyContent: 'space-evenly'
    },
    alertIconStyle: {
        height: 35,
        width: 35,
    },
    alertTitleTextStyle: {
        flex: 1,
        textAlign: 'center',
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: 'bold',
        padding: 2,
        marginHorizontal: 2
    },
    alertMessageTextStyle: {
        color: '#FFFFFF',
        textAlign: 'justify',
        fontSize: 16,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    alertMessageButtonStyle: {
        width: '30%',
        paddingHorizontal: 6,
        marginVertical: 4,
        borderRadius: 10,
        backgroundColor: '#E78D35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertMessageButtonTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF'
    },

});