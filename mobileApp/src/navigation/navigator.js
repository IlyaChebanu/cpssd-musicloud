import React, { Component } from "react"
import { connect } from "react-redux"
import { createStackNavigator } from "react-navigation-stack"
import { reduxifyNavigator, createReactNavigationReduxMiddleware, createReduxContainer, } from "react-navigation-redux-helpers";

import StartScreen from "../screens/startScreen/startScreen"
import MusicPlayerScreen from "../screens/musicPlayerScreen/musicPlayerScreen"
import HomeScreen from "../screens/homeScreen/homeScreen"
import { DrawerNavigator } from "./drawerNavigator";
import * as screenNames from "./screenNames";
import userProfileScreen from "../screens/userProfileScreen/userProfileScreen";

export const AppNavigator = createStackNavigator({
    [screenNames.START_SCREEN]: { screen: StartScreen },
    [screenNames.HOME_SCREEN]: { screen: DrawerNavigator},
    [screenNames.MUSIC_PLAYER_SCREEN]: { screen: MusicPlayerScreen},
    [screenNames.USER_PROFILE_SCREEN]: { screen: userProfileScreen},
}, {
        initialRouteName: [screenNames.START_SCREEN],
        // Default config for all screens
        headerMode: "none",
        navigationOptions: {
            gesturesEnabled: false,
        }
    });


export const navMiddleware = createReactNavigationReduxMiddleware(state => state.nav);

const AppWithNavigationState = createReduxContainer(AppNavigator, "root");
//createReduxContainer(navigator: any, key?: string): React.ComponentType<any>
// reduxifyNavigator(navigator: NavigationContainer, key: string): React.ComponentType<{ state: NavigationState; dispatch: NavigationDispatch; }>

const mapStateToProps = (state) => ({ state: state.nav });

export default connect(mapStateToProps)(AppWithNavigationState);