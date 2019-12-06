import cookie from 'js-cookie';
import jwt from 'jsonwebtoken';
import history from '../history';

const token = cookie.get('token') || '';
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
  profilePicUrl: '',
}, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'DELETE_TOKEN':
      return {
        ...state,
        token: undefined,
      };
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.username,
      };
    case 'DELETE_USERNAME':
      return {
        ...state,
        username: undefined,
      };
    case 'SET_PROFILE_PIC_URL':
      return {
        ...state,
        profilePicUrl: action.profilePicUrl,
      };
    case 'DELETE_PROFILE_PIC_URL':
      return {
        ...state,
        profilePicUrl: undefined,
      };
    default:
      return state;
  }
};
