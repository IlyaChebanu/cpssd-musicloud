import * as dummyActions from "./dummyActions";
import * as navActions from "./navActions";

//Combime all your actions
export const ActionCreators = Object.assign({}, 
    dummyActions,
    navActions,
);