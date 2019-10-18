import React, { Component } from "react"
import { connect } from "react-redux"
import { createStackNavigator } from "react-navigation-stack"
import { reduxifyNavigator, createReactNavigationReduxMiddleware, createReduxContainer, } from "react-navigation-redux-helpers";

import DummyScreen from "../screens/dummyScreen/dummyScreen"
import * as screenNames from "./screenNames";

export const AppNavigator = createStackNavigator({
    [screenNames.DUMMY_SCREEN]: { screen: DummyScreen },
}, {
        initialRouteName: [screenNames.DUMMY_SCREEN],
        // Default config for all screens
        headerMode: "none",
        navigationOptions: {
            gesturesEnabled: false,
        }
    });


export const navMiddleware = createReactNavigationReduxMiddleware("root", state => state.nav);
const AppWithNavigationState = createReduxContainer(AppNavigator, "root");
//createReduxContainer(navigator: any, key?: string): React.ComponentType<any>
// reduxifyNavigator(navigator: NavigationContainer, key: string): React.ComponentType<{ state: NavigationState; dispatch: NavigationDispatch; }>
const mapStateToProps = (state) => ({ state: state.nav });

export default connect(mapStateToProps)(AppWithNavigationState);