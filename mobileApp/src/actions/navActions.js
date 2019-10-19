import { NavigationActions, DrawerActions } from "react-navigation";
import * as screenNames from "./../navigation/screenNames"

export const navigateBack = () => NavigationActions.back();

export const navigateBackToScreen = (screenKey) =>
    NavigationActions.back({
        key: screenKey,
    });

export const navigateToDummyScreen = () =>
    NavigationActions.navigate({
        routeName: screenNames.DUMMY_SCREEN
    });

export const navigateToStartScreen = () =>
    NavigationActions.navigate({
        routeName: screenNames.START_SCREEN
    });

export const navigateToLoginScreen = () =>
    NavigationActions.navigate({
        routeName: screenNames.LOGIN_SCREEN
    });

export const navigateToRegisterScreen = () =>
    NavigationActions.navigate({
        routeName: screenNames.REGISTER_SCREEN
    });

