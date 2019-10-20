import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    linkText: {
        // flex: 1,
        fontSize: 21,
        marginLeft: 15,
        textAlign: 'left',
        color: 'white',
    },
    linkButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        height: 50,
        marginBottom: 1,
        flexDirection: 'row',
    },
    borderLeft: {
        backgroundColor: 'rgba(255,255,255,0.13)',
        width: 5,
        height: '100%',
    },
    linkContainer: {
        flex: 1,
        paddingTop: 50,
    }

})