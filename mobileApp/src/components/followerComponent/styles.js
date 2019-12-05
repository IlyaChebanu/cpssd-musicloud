import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
    },
    followingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
    },
    nameText: {
        color: '#FFF',
        marginRight: 20,
    },
    profileImg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 20,
    },
    button: {
        borderRadius: 5,
        width: 100,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    followButton: {
        position: 'absolute',
        right: 20,
        borderRadius: 5,
        width: 100,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#FF0265',
        borderWidth: 1,
    },
    followingButton: {
        position: 'absolute',
        right: 20,
    },
    followText: {
        color: '#FFF',
    },
    defaultText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 16,
    },

})