import * as dummyActions from "./dummyActions";
import * as navActions from "./navActions";
import * as homeActions from "./homeActions";
import * as regActions from "./registrationActions";
import * as songActions from "./songActions";
import * as userActions from "./userActions";

//Combime all your actions
export const ActionCreators = Object.assign({}, 
    dummyActions,
    homeActions,
    navActions,
    regActions,
    songActions,
    userActions,
);