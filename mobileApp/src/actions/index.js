import * as dummyActions from "../actions/dummyActions";
import * as navActions from "../actions/navActions";

//Combime all your actions
export const ActionCreators = Object.assign({}, 
    dummyActions,
    navActions,
);