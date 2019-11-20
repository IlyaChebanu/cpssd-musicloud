import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'grey',
    },
})