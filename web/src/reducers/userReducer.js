import cookie from 'js-cookie';
import history from '../history';
import jwt from 'jsonwebtoken';

let token = cookie.get('token') || '';
let username = '';
if (token) {
  const decoded = jwt.decode(token);
  username = decoded.username;
  if (['/', '/login'].includes(window.location.pathname)) {
    history.push('/discover');
  }
}


export default (state = {
  token,
  username,
  profilePicUrl: ''
}, action) => {
  switch (action.type) {
   case 'SET_TOKEN':
    return {
     token: action.payload
    }
  case 'DELETE_TOKEN':
    return {
      token: undefined
    }
  case 'SET_USERNAME':
    return {
     username: action.username
    }
  case 'DELETE_USERNAME':
    return {
      username: undefined
    }
  case 'SET_PROFILE_PIC_URL':
    return {
      profilePicUrl: action.profilePicUrl
    }
  case 'DELETE_PROFILE_PIC_URL':
    return {
      profilePicUrl: undefined
    }
   default:
    return state
  }
 }