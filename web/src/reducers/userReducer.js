import cookie from 'js-cookie';
import history from '../history';

let token = cookie.get('token');
if (token) {
  // TODO: Test token, and set to '' if wrong
  if (['/', '/login'].includes(window.location.pathname))
  history.push('/discover');
}


export default (state = { token }, action) => {
  switch (action.type) {
   case 'SET_TOKEN':
    return {
     token: action.payload
    }
  case 'DELETE_TOKEN':
    return {
      token: undefined
    }
   default:
    return state
  }
 }