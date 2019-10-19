import React, { Component } from "react"
import { connect } from "react-redux"
import { createStackNavigator } from "react-navigation-stack"
import { reduxifyNavigator, createReactNavigationReduxMiddleware, createReduxContainer, } from "react-navigation-redux-helpers";

import DummyScreen from "../screens/dummyScreen/dummyScreen"
import StartScreen from "../screens/startScreen/startScreen"
import LoginScreen from "../screens/loginScreen/loginScreen"
import RegisterScreen from "../screens/registerScreen/registerScreen"
import HomeScreen from "../screens/homeScreen/homeScreen"
import * as screenNames from "./screenNames";

export const AppNavigator = createStackNavigator({
    [screenNames.START_SCREEN]: { screen: StartScreen },
    [screenNames.LOGIN_SCREEN]: { screen: LoginScreen},
    [screenNames.REGISTER_SCREEN]: { screen: RegisterScreen},
    [screenNames.HOME_SCREEN]: { screen: HomeScreen},
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