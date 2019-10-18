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

