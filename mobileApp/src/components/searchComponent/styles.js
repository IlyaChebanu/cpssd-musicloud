import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 20,
    },
    searchText: {
        color: '#FFF',
        paddingLeft: 10,
        paddingTop: 20,
        marginBottom: 2,
    },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        height: 34,
        borderRadius: 5,
        justifyContent: 'center',
    },
    searchInput: {
        color: '#FFF',
        fontSize: 18,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 10,
    },
    sortContainer: {
        flexDirection: 'row',
        paddingTop: 7,
        justifyContent: 'space-between',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        color: '#FFF',
        fontSize: 15,
    },
    sortImage: {
        width: 15,
        height: 15,
    },
})