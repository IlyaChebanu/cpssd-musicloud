import { AppNavigator } from "../navigation/navigator";
import * as screenNames from "../navigation/screenNames";

const router = AppNavigator.router;
const mainNavAction = router.getActionForPathAndParams(screenNames.START_SCREEN);
const initialNavState = router.getStateForAction(mainNavAction);

export const NavReducer = (state = initialNavState, action) => {

    if (action.routeName !== undefined) {
      console.log("NavReducer : Navigating to screen " + action.routeName)
    }

    const newState = AppNavigator.router.getStateForAction(action, state)

    // return newState or previous state if newState is null
    return newState || state;
};

// export default NavReducer;