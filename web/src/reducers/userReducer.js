import cookie from 'js-cookie';

let token = cookie.get('token');
if (token) {
  // TODO: Test token, and set to '' if wrong
}


export default (state = { user: { token} }, action) => {
  switch (action.type) {
   case 'SET_TOKEN':
    return {
     result: action.payload
    }
   default:
    return state
  }
 }