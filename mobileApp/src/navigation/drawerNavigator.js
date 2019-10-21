import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { createDrawerNavigator } from 'react-navigation-drawer';
import HomeScreen from "../screens/homeScreen/homeScreen";
import ProfileScreen from "../screens/profileScreen/profileScreen"
import MenuDrawer from "../components/menuDrawer/menuDrawer"
import * as screenNames from "./screenNames";
import { createStackNavigator } from 'react-navigation-stack';

const DrawerConfig = {
    drawerPosition: 'right',
    contentComponent: ({ navigation }) => {
        return(<MenuDrawer navigation={navigation}/>)
    }
}

export const DrawerNavigator = createDrawerNavigator({
    Home: {
        screen: HomeScreen
    },
    Profile: {
        screen: ProfileScreen
    }
    },
        DrawerConfig
    );
