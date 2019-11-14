import AsyncStorage from '@react-native-community/async-storage';
export const TOKEN_DATA_KEY = '@musicloud:authToken';
export const USERNAME_DATA_KEY = '@musicloud:username';

export async function readStorageData(dataKey) {
    try {
        let val = await AsyncStorage.getItem(dataKey);
        if (val !== null) {
            let data = await JSON.parse(val);
            // console.log("LocalStorage : readStorageData for key " + dataKey + ",  data " + JSON.stringify(data));
            return data;
        } else {
            console.log("LocalStorage : error Data not found ");
            return null
        }
    } catch (error) {
        console.log("LocalStorage : error " + error.message);
        return error
    }
}

export async function writeDataToStorage(data, dataKey) {
    // console.log("LocalStorage : writeDataToStorage for key " + JSON.stringify(dataKey) + ",  data " + JSON.stringify(data));
    try {
        await AsyncStorage.setItem(dataKey, JSON.stringify(data));
    }
    catch (error) {
        console.log('LocalStorage : ERROR SAVING DATA');
    }
}

export async function clearAllStorage() {
    AsyncStorage.clear();
}