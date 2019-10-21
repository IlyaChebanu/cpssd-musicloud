import * as dummyActions from "./dummyActions";
import * as navActions from "./navActions";
import * as homeActions from "./homeActions";
import * as regActions from "./registrationActions";

//Combime all your actions
export const ActionCreators = Object.assign({}, 
    dummyActions,
    homeActions,
    navActions,
    regActions,
);